from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
import logging
import threading
import json
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("ResumeMatcher")

# Thread-safe in-memory cache for Sentence Transformer embeddings
EMBEDDING_CACHE = {}
cache_lock = threading.Lock()

# Load Sentence Transformer model once at application startup
model = None
try:
    logger.info("Importing SentenceTransformer dynamically...")
    from sentence_transformers import SentenceTransformer
    logger.info("Initializing SentenceTransformer model 'sentence-transformers/all-MiniLM-L6-v2'...")
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    logger.info("SentenceTransformer model successfully loaded.")
except (ImportError, OSError, Exception) as e:
    logger.error(f"Failed to load SentenceTransformer/Torch library or model at startup: {e}. Will fall back to TF-IDF.")
    model = None

def get_embedding(text):
    if not text:
        return None
    with cache_lock:
        if text in EMBEDDING_CACHE:
            return EMBEDDING_CACHE[text]
    try:
        embedding = model.encode(text, convert_to_numpy=True)
    except Exception as e:
        logger.error(f"Error encoding text with SentenceTransformer: {e}")
        return None
    with cache_lock:
        if len(EMBEDDING_CACHE) >= 10000:
            logger.info("Embedding cache size limit reached. Clearing cache to free memory.")
            EMBEDDING_CACHE.clear()
        EMBEDDING_CACHE[text] = embedding
    return embedding

app = Flask(__name__)
CORS(app)

# Load skills taxonomy
TAXONOMY_PATH = os.path.join(os.path.dirname(__file__), 'skills_taxonomy.json')
try:
    with open(TAXONOMY_PATH, 'r') as f:
        SKILLS_TAXONOMY = json.load(f)
except Exception as e:
    logger.error(f"Failed to load skills taxonomy file: {e}. Using built-in fallback.")
    SKILLS_TAXONOMY = {
        "Java": ["java", "jdk", "jre"],
        "Spring Boot": ["spring boot", "springboot", "spring-boot", "spring framework", "spring security", "spring data"],
        "React": ["react", "react.js", "reactjs", "react-router"],
        "Angular": ["angular", "angular.js", "angularjs"],
        "Python": ["python", "py"],
        "AWS": ["aws", "amazon web services", "ec2", "s3", "rds", "lambda", "fargate", "ecs", "eks"],
        "Docker": ["docker", "dockerfile", "docker-compose", "containerization"],
        "Kubernetes": ["kubernetes", "k8s", "helm", "minikube"],
        "MySQL": ["mysql", "my-sql"],
        "PostgreSQL": ["postgresql", "postgres", "psql"],
        "MongoDB": ["mongodb", "mongo"],
        "Redis": ["redis", "in-memory cache"],
        "Kafka": ["kafka", "apache kafka"],
        "Terraform": ["terraform", "iac"],
        "Jenkins": ["jenkins", "jenkinsfile"],
        "GitHub Actions": ["github actions", "github-actions"],
        "Next.js": ["next.js", "nextjs", "next js"],
        "TypeScript": ["typescript", "ts"],
        "CI/CD": ["ci/cd", "ci-cd", "continuous integration", "continuous deployment"],
        "GraphQL": ["graphql", "gql"],
        "HTML": ["html", "html5"],
        "CSS": ["css", "css3", "sass", "scss", "tailwind"],
        "REST API": ["rest api", "restful api", "restful apis", "apis"],
        "Microservices": ["microservices", "microservice"],
        "System Design": ["system design", "distributed systems", "load balancing", "scalability"],
        "Machine Learning": ["machine learning", "ml", "neural networks", "deep learning"],
        "Data Science": ["data science", "pandas", "numpy"]
    }

# Tech families mapping canonical names
TECH_FAMILIES = {
    "Backend Ecosystem": {"Java", "Spring Boot", "Spring", "Hibernate", "JPA", "C++", "Node.js", "Express.js", "Django", "Flask", "Python", "Microservices"},
    "Frontend Ecosystem": {"React", "Angular", "Vue", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "GraphQL", "Jest"},
    "Databases": {"MySQL", "PostgreSQL", "MongoDB", "Redis", "SQL", "NoSQL", "Elasticsearch"},
    "DevOps & Cloud": {"AWS", "Docker", "Kubernetes", "Terraform", "Jenkins", "GitHub Actions", "CI/CD", "Ansible", "Prometheus", "Grafana"},
    "AI & Data Science": {"Python", "Machine Learning", "Data Science", "TensorFlow", "PyTorch", "Scikit-Learn"},
    "Messaging & Caching": {"Kafka", "Redis"}
}

ACTION_VERBS = [
    "developed", "led", "optimized", "managed", "designed", "built", 
    "implemented", "achieved", "solved", "created", "scaled", 
    "migrated", "improved", "reduced", "architected", "engineered",
    "spearheaded", "orchestrated", "modernized", "deployed"
]

CERTIFICATIONS_LIST = [
    "AWS Certified", "AWS Cloud Practitioner", "AWS Solutions Architect", "AWS Developer",
    "Google Cloud Certified", "Associate Cloud Engineer", "Professional Cloud Architect",
    "Azure Fundamentals", "Azure Solutions Architect", "Azure Developer Associate",
    "Certified Scrum Master", "CSM", "Project Management Professional", "PMP",
    "Certified Kubernetes Administrator", "CKA", "CKAD", "Oracle Certified Associate",
    "Oracle Certified Professional", "OCA", "OCP", "Spring Certified Professional"
]

DEGREES_LIST = {
    "PhD": ["phd", "ph.d.", "doctor of philosophy"],
    "Master": ["master", "m.s.", "ms", "mtech", "m.tech", "mba"],
    "Bachelor": ["bachelor", "b.s.", "bs", "btech", "b.tech", "bca", "bsc", "b.sc."]
}

MAJORS_LIST = [
    "computer science", "software engineering", "information technology",
    "computer engineering", "cs", "it", "math", "physics", "engineering", "science"
]

def preprocess(text):
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_keywords(text):
    if not text:
        return []
    lower_text = text.lower()
    found = []
    for canonical_name, aliases in SKILLS_TAXONOMY.items():
        for alias in aliases:
            pattern = r'\b' + re.escape(alias.lower()) + r'\b'
            if re.search(pattern, lower_text):
                found.append(canonical_name)
                break
    return list(set(found))

def extract_years_of_experience(exp_text):
    if not exp_text:
        return 0
    patterns = [
        r'\b(\d+)\s*(?:\+|plus)?\s*years?\s*(?:of)?\s*(?:experience|work|prof|tech|dev)?\b',
        r'\b(\d+)\s*(?:yrs?)\b'
    ]
    years_list = []
    for pattern in patterns:
        matches = re.findall(pattern, exp_text, re.IGNORECASE)
        for m in matches:
            years_list.append(int(m))
            
    date_ranges = re.findall(r'\b(20\d{2})\s*(?:-|–|—|to)\s*(20\d{2}|present|current)\b', exp_text, re.IGNORECASE)
    computed_years = 0
    for start_yr, end_yr in date_ranges:
        start = int(start_yr)
        if end_yr.lower() in ["present", "current"]:
            end = 2026
        else:
            end = int(end_yr)
        diff = max(0, end - start)
        computed_years += diff
        
    if years_list:
        return max(max(years_list), computed_years)
    return max(0, computed_years)

def parse_resume_metadata(skills_text, experience_text, education_text):
    combined_text = f"{skills_text}\n{experience_text}\n{education_text}"
    skills = extract_keywords(combined_text)
    
    skills_by_family = {}
    for sk in skills:
        for family, f_skills in TECH_FAMILIES.items():
            if sk in f_skills:
                skills_by_family.setdefault(family, []).append(sk)
                
    # Contact parsing
    lower_text = combined_text.lower()
    email_match = re.search(r'\b[\w\.-]+@[\w\.-]+\.\w{2,}\b', lower_text)
    phone_match = re.search(r'\b\+?\d{1,4}?[\s-]?\(?\d{1,3}?\)?[\s-]?\d{3,4}[\s-]?\d{3,4}\b', lower_text)
    linkedin_match = re.search(r'linkedin\.com/in/[\w\-]+', lower_text)
    github_match = re.search(r'github\.com/[\w\-]+', lower_text)
    portfolio_match = re.search(r'\b(?:portfolio|website|homepage)\b|(?:\b\w+\.(?:github\.io|me|dev)\b)', lower_text)
    
    contact = {
        "email": email_match.group(0) if email_match else None,
        "phone": phone_match.group(0) if phone_match else None,
        "linkedin": linkedin_match.group(0) if linkedin_match else None,
        "github": github_match.group(0) if github_match else None,
        "portfolio": portfolio_match.group(0) if portfolio_match else None
    }
    
    # Education parsing
    degree_found = None
    for deg_canonical, variants in DEGREES_LIST.items():
        for var in variants:
            if re.search(r'\b' + re.escape(var) + r'\b', lower_text):
                degree_found = deg_canonical
                break
        if degree_found:
            break
            
    major_found = None
    for major in MAJORS_LIST:
        if re.search(r'\b' + re.escape(major) + r'\b', lower_text):
            major_found = major.title()
            break
            
    education = {
        "degree": degree_found,
        "major": major_found
    }
    
    # Certifications
    certs = []
    for cert in CERTIFICATIONS_LIST:
        if re.search(r'\b' + re.escape(cert.lower()) + r'\b', lower_text):
            certs.append(cert)
            
    # Metrics
    metrics_pattern = r'\b\d+(?:\.\d+)?\s*(?:%|percent|x|k|m|million|usd|hours?|developers?|employees?|sprints?)\b'
    metrics = re.findall(metrics_pattern, experience_text, re.IGNORECASE)
    
    # Action verbs
    found_verbs = []
    for verb in ACTION_VERBS:
        if re.search(r'\b' + re.escape(verb) + r'\b', experience_text.lower()):
            found_verbs.append(verb)
            
    # Projects
    projects = []
    project_sentences = re.findall(r'([^.\n]*\bprojects?\b[^.\n]*)', combined_text, re.IGNORECASE)
    for p in project_sentences:
        clean = p.strip()
        if len(clean) > 20:
            projects.append(clean)
            
    years_exp = extract_years_of_experience(experience_text)
    
    return {
        "skills": set(skills),
        "skills_by_family": skills_by_family,
        "contact": contact,
        "education": education,
        "certifications": certs,
        "metrics": metrics,
        "action_verbs": found_verbs,
        "projects": projects,
        "years_experience": years_exp
    }

def get_transferable_skills_credit(cand_skills, job_skills):
    if not job_skills:
        return 1.0
    score_sum = 0.0
    for req_skill in job_skills:
        if req_skill in cand_skills:
            score_sum += 1.0
        else:
            # Check for family matching (transferable skills)
            for family_skills in TECH_FAMILIES.values():
                if req_skill in family_skills:
                    cand_family_overlap = family_skills.intersection(cand_skills)
                    if cand_family_overlap:
                        score_sum += 0.4
                        break
    return score_sum / len(job_skills)

def calculate_match_score(candidate_skills, job_description):
    candidate_text = preprocess(candidate_skills)
    job_text = preprocess(job_description)

    if not candidate_text or not job_text:
        return 0.0

    # 1. Semantic Similarity
    semantic_similarity = 0.0
    if model is not None:
        try:
            candidate_emb = get_embedding(candidate_text)
            job_emb = get_embedding(job_text)
            if candidate_emb is not None and job_emb is not None:
                dot_product = np.dot(candidate_emb, job_emb)
                norm_cand = np.linalg.norm(candidate_emb)
                norm_job = np.linalg.norm(job_emb)
                if norm_cand > 0 and norm_job > 0:
                    semantic_similarity = max(0.0, float(dot_product / (norm_cand * norm_job)))
        except Exception as e:
            logger.error(f"Error calculating SentenceTransformer similarity: {e}")
            
    # Fallback to TF-IDF if semantic similarity was not calculated
    if semantic_similarity == 0.0:
        try:
            vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
            tfidf_matrix = vectorizer.fit_transform([candidate_text, job_text])
            semantic_similarity = max(0.0, float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]))
        except Exception as e:
            logger.error(f"Error calculating TF-IDF: {e}")
            # Keyword fallback
            cand_words = set(candidate_text.split())
            job_words = set(job_text.split())
            if job_words:
                semantic_similarity = len(cand_words & job_words) / len(job_words)

    # 2. Skill Overlap & Transferable Skills
    cand_extracted = set(extract_keywords(candidate_skills))
    job_extracted = set(extract_keywords(job_description))
    skill_match = get_transferable_skills_credit(cand_extracted, job_extracted)

    # 3. Experience Match
    text_combined = job_description.lower()
    job_level = "Mid"
    if any(w in text_combined for w in ["lead", "architect", "principal", "staff", "manager", "senior"]):
        job_level = "Senior"
    elif any(w in text_combined for w in ["junior", "associate", "intern", "trainee", "entry"]):
        job_level = "Junior"
        
    years_exp = extract_years_of_experience(candidate_skills + " " + job_description)
    
    if job_level == "Senior":
        exp_score = 100.0 if years_exp >= 5 else (75.0 if years_exp >= 3 else 40.0)
    elif job_level == "Junior":
        exp_score = 100.0 if years_exp <= 2 else (85.0 if years_exp <= 4 else 60.0)
    else:
        exp_score = 100.0 if 3 <= years_exp <= 5 else (90.0 if years_exp > 5 else 65.0)

    # 4. Project Match
    has_projects = any(w in candidate_skills.lower() for w in ["project", "portfolio", "github.com"])
    project_score = 100.0 if has_projects else 50.0

    # Weighted Hybrid Score
    raw_score = (0.50 * semantic_similarity * 100.0) + (0.25 * skill_match * 100.0) + (0.15 * exp_score) + (0.10 * project_score)

    # Scale to industry standard (85-95 strong, 65-84 moderate, below 65 weak)
    if raw_score >= 80.0:
        scaled = 85.0 + (raw_score - 80.0) * 0.5
    elif raw_score >= 50.0:
        scaled = 65.0 + (raw_score - 50.0) * 0.63
    else:
        scaled = raw_score * 1.3
        
    return round(max(0.0, min(100.0, scaled)), 2)

@app.route('/match', methods=['POST'])
def match():
    data = request.get_json() or {}
    candidate_skills = data.get('candidate_skills', '')
    job_description = data.get('job_description', '')
    score = calculate_match_score(candidate_skills, job_description)
    return jsonify({
        'score': score,
        'candidate_skills': candidate_skills[:100] if candidate_skills else '',
        'status': 'success'
    })

@app.route('/match-bulk', methods=['POST'])
def match_bulk():
    data = request.get_json() or {}
    candidate_skills = data.get('candidate_skills', '')
    jobs = data.get('jobs', [])
    results = []
    for job in jobs:
        score = calculate_match_score(candidate_skills, job.get('description', '') + ' ' + job.get('skills', ''))
        results.append({'job_id': job.get('id'), 'score': score})
    results.sort(key=lambda x: x['score'], reverse=True)
    return jsonify({'results': results})

def generate_skill_recommendation(skill, gap_category):
    descriptions = {
        "Spring Boot": {
            "why": "Spring Boot is the standard framework for enterprise Java development, driving secure and high-throughput microservices.",
            "topics": "Spring Core, Dependency Injection, REST APIs, Spring Security (JWT), Spring Data JPA, and transactional query optimizations.",
            "project": "Build a Multi-Tenant SaaS E-Commerce REST API with RBAC security, DB pooling, and unit/integration coverage.",
            "duration": "3-4 weeks"
        },
        "React": {
            "why": "React is the leading frontend framework, essential for building rich, interactive, and responsive user interfaces.",
            "topics": "Functional components, state hooks (useState, useEffect, useContext), Custom Hooks, state managers (Redux Toolkit), and server-side rendering.",
            "project": "Design a complete responsive Real-Time Analytics Dashboard client fetching dynamic JSON telemetry.",
            "duration": "2-3 weeks"
        },
        "Docker": {
            "why": "Docker standardizes deployment environments, containerizing services to ensure consistent dev-to-prod execution.",
            "topics": "Writing efficient Dockerfiles, caching build layers, container networks, volumes, and multi-stage builds.",
            "project": "Write a multi-stage Dockerfile to containerize a web application and hook up Docker Compose for local database networking.",
            "duration": "1-2 weeks"
        },
        "Kubernetes": {
            "why": "Kubernetes is the standard orchestration framework for automating the deployment, scaling, and management of containerized apps.",
            "topics": "Pods, Deployments, Services (LoadBalancer/ClusterIP), Ingress Routing, ConfigMaps, Secrets, and horizontal autoscaling.",
            "project": "Deploy a multi-tier containerized stack on a local Minikube cluster with active load-balancing and ingress policies.",
            "duration": "3-4 weeks"
        },
        "AWS": {
            "why": "AWS is the market-leading public cloud platform, key for cloud-native software architecture and cloud infrastructure hosting.",
            "topics": "EC2 virtual servers, S3 storage, RDS databases, IAM security roles, VPC networks, Route53 DNS, and Lambda serverless functions.",
            "project": "Deploy a secure server architecture inside a custom VPC with public/private subnets and an RDS database instance.",
            "duration": "3-4 weeks"
        }
    }
    
    info = descriptions.get(skill, {
        "why": f"{skill} is highly sought after for scaling architectures, structuring dynamic codebases, and automating delivery pipelines.",
        "topics": f"Core conventions, syntax, standard library modules, error boundaries, performance audit profiles, and best production practices.",
        "project": f"Create a production-ready repository module leveraging {skill} that handles error boundaries and integrates cleanly with external modules.",
        "duration": "2-3 weeks"
    })
    
    return f"[{gap_category} Gap] Learn {skill}: {info['why']} Master key concepts: {info['topics']}. Suggested Project: {info['project']} (Estimated Timeline: {info['duration']})."

@app.route('/gap-analysis', methods=['POST'])
def gap_analysis():
    data = request.get_json() or {}
    candidate_skills_str = data.get('candidate_skills', '')
    job_req_str = data.get('job_description', '') + ' ' + data.get('job_skills', '')
    
    cand_keywords = set(extract_keywords(candidate_skills_str))
    job_keywords = set(extract_keywords(job_req_str))
    
    # Fallback to comma splitting
    if not job_keywords:
        job_keywords = set([s.strip().title() for s in data.get('job_skills', '').split(',') if s.strip()])
        cand_keywords = set([s.strip().title() for s in candidate_skills_str.split(',') if s.strip()])
        
    # Mandatory vs Optional classification
    sentences = re.split(r'[.!?\n]', data.get('job_description', ''))
    mandatory_skills = set()
    optional_skills = set()
    
    mandatory_indicators = ["must", "require", "essential", "minimum", "mandatory", "criteria", "strong experience in", "background in"]
    optional_indicators = ["preferred", "nice to have", "plus", "optional", "bonus", "familiarity", "desire", "advantage"]
    
    for sentence in sentences:
        s_lower = sentence.lower()
        s_skills = set(extract_keywords(sentence))
        
        if any(ind in s_lower for ind in mandatory_indicators):
            mandatory_skills.update(s_skills)
        elif any(ind in s_lower for ind in optional_indicators):
            optional_skills.update(s_skills)
            
    for skill in job_keywords:
        if skill not in mandatory_skills and skill not in optional_skills:
            mandatory_skills.add(skill)
            
    missing_mandatory = [s for s in mandatory_skills if s not in cand_keywords]
    missing_optional = [s for s in optional_skills if s not in cand_keywords]
    
    overlap_mandatory = [s for s in mandatory_skills if s in cand_keywords]
    overlap_optional = [s for s in optional_skills if s in cand_keywords]
    
    denom = max(1.0 * len(mandatory_skills) + 0.4 * len(optional_skills), 1.0)
    numer = 1.0 * len(overlap_mandatory) + 0.4 * len(overlap_optional)
    readiness_score = round((numer / denom) * 100.0, 2)
    
    suggestions = []
    all_missing = missing_mandatory + missing_optional
    for skill in all_missing:
        is_mandatory = skill in mandatory_skills
        has_family_overlap = False
        for family_skills in TECH_FAMILIES.values():
            if skill in family_skills:
                family_overlap = family_skills.intersection(cand_keywords)
                if family_overlap:
                    has_family_overlap = True
                    break
        
        if has_family_overlap:
            gap_cat = "Intermediate"
        elif is_mandatory:
            gap_cat = "Advanced"
        else:
            gap_cat = "Beginner"
            
        suggestions.append(generate_skill_recommendation(skill, gap_cat))
        
    if not all_missing:
        suggestions.append("Outstanding fit! Your skillset covers all listed core job keywords. Review system designs to prepare for team interviews.")
        
    return jsonify({
        "readinessScore": readiness_score,
        "missingSkills": all_missing,
        "suggestions": suggestions
    })

@app.route('/ats-score', methods=['POST'])
def ats_score():
    data = request.get_json() or {}
    skills = data.get('skills', '')
    experience = data.get('experience', '')
    education = data.get('education', '')
    
    metadata = parse_resume_metadata(skills, experience, education)
    
    # 1. Contact (Max 15)
    contact_score = 0.0
    if metadata["contact"]["email"]: contact_score += 4.0
    if metadata["contact"]["phone"]: contact_score += 4.0
    if metadata["contact"]["linkedin"]: contact_score += 4.0
    if metadata["contact"]["github"] or metadata["contact"]["portfolio"]: contact_score += 3.0
    
    # 2. Skills (Max 25)
    skills_score = 0.0
    density = len(metadata["skills"])
    if density >= 8: skills_score += 15.0
    elif density >= 4: skills_score += 10.0
    elif density >= 1: skills_score += 5.0
    
    diversity = len(metadata["skills_by_family"])
    if diversity >= 3: skills_score += 10.0
    elif diversity == 2: skills_score += 7.0
    elif diversity == 1: skills_score += 4.0
    
    # 3. Experience (Max 30)
    experience_score = 0.0
    verbs_count = len(metadata["action_verbs"])
    if verbs_count >= 4: experience_score += 10.0
    elif verbs_count >= 2: experience_score += 7.0
    elif verbs_count == 1: experience_score += 4.0
    
    has_metrics = len(metadata["metrics"]) > 0
    if has_metrics: experience_score += 10.0
    
    exp_len = len(experience.strip())
    if exp_len >= 500: experience_score += 10.0
    elif exp_len >= 200: experience_score += 7.0
    elif exp_len >= 1: experience_score += 3.0
    
    # 4. Education (Max 15)
    education_score = 0.0
    if metadata["education"]["degree"]: education_score += 10.0
    if metadata["education"]["major"]: education_score += 5.0
    
    # 5. Projects and Certifications (Max 15)
    projects_certs_score = 0.0
    if metadata["certifications"]: projects_certs_score += 8.0
    if metadata["projects"] or "project" in skills.lower(): projects_certs_score += 7.0
    
    total_ats_score = round(contact_score + skills_score + experience_score + education_score + projects_certs_score, 2)
    total_ats_score = max(0.0, min(100.0, total_ats_score))
    
    analysis = {
        "skillsSection": density > 0,
        "experienceSection": exp_len > 30,
        "educationSection": len(education.strip()) > 15,
        "contactDetails": contact_score > 0,
        "projectsSection": len(metadata["projects"]) > 0,
        "certificationsSection": len(metadata["certifications"]) > 0
    }
    
    recommendations = []
    if not metadata["contact"]["email"] or not metadata["contact"]["phone"]:
        recommendations.append("Contact Information Incomplete: Provide a professional email and phone number to allow recruiter screening.")
    if not metadata["contact"]["linkedin"] or not metadata["contact"]["github"]:
        recommendations.append("Professional Portfolios Missing: Link your LinkedIn profile and GitHub account to showcase project histories.")
    if density < 8:
        recommendations.append("Expand Technical Skills: You only have recognized keywords. Add complementary skills, toolchains, or microservice components.")
    if diversity < 3:
        recommendations.append("Diversify Technology Families: Expand adjacent tools (Docker, AWS, Git, databases) to prove end-to-end full stack agility.")
    if verbs_count < 3:
        recommendations.append("Action-Oriented Bullets: Begin experience points with impactful action verbs (e.g. 'architected', 'orchestrated') rather than passive descriptions.")
    if not has_metrics:
        recommendations.append("Quantify Achievements: Insert numeric variables (e.g. 'reduced API response times by 35%') to prove business impact scale.")
    if not metadata["education"]["degree"] or not metadata["education"]["major"]:
        recommendations.append("Formalize Academic Details: State your exact degree (e.g., Bachelor of Science) and technical major clearly.")
    if not metadata["certifications"]:
        recommendations.append("List Industry Certifications: Adding certifications (AWS Cloud Architect, Kubernetes CKA) boosts professional validation.")
    if not metadata["projects"]:
        recommendations.append("Detail Engineering Projects: Specify 2-3 portfolio projects detailing technical stack and performance gains.")
        
    recommendations.append("Maintain Format Scannability: Avoid multi-column layouts, graphics, or tables to ensure seamless parser ingestion.")
    
    return jsonify({
        "atsScore": total_ats_score,
        "structureAnalysis": analysis,
        "recommendations": recommendations
    })

@app.route('/interview-questions', methods=['POST'])
def interview_questions():
    data = request.get_json() or {}
    skills_str = data.get('candidate_skills', '')
    job_title = data.get('job_title', 'Software Engineer')
    job_desc = data.get('job_description', '')
    
    cand_keywords = extract_keywords(skills_str)
    
    hr = [
        f"Why are you interested in joining us as a {job_title} and how does this role align with your long-term career trajectory?",
        "Describe a scenario where you faced conflicting design requirements from product managers and engineers. How did you negotiate and resolve the dispute?",
        "Tell me about a time you had to adapt quickly to an unfamiliar toolchain or technical stack to deliver a critical project feature. What was your study approach?"
    ]
    
    tech = []
    if any(s in cand_keywords for s in ["Java", "Spring Boot", "Spring"]):
        tech.append("How does Dependency Injection function in Spring Boot, and what are the trade-offs of using Constructor vs Field Injection?")
        tech.append("Explain the memory management architecture in JVM. How do you troubleshoot and fix memory leaks or CPU spikes in Spring Boot microservices?")
    if "React" in cand_keywords or "Next.js" in cand_keywords:
        tech.append("What are React Hooks, how does the Virtual DOM optimization cycle operate, and how do Server Actions function in Next.js?")
        tech.append("Describe your approach to state management in large-scale React clients. Under what scenarios do you prefer Redux Toolkit over Context API?")
    if any(s in cand_keywords for s in ["MySQL", "PostgreSQL", "SQL"]):
        tech.append("How do clustered versus non-clustered indexes differ? Explain how you diagnose and optimize a slow query execution plan.")
    if any(s in cand_keywords for s in ["Docker", "Kubernetes"]):
        tech.append("How do container network layers function, and how do you achieve zero-downtime rolling updates in Kubernetes?")
    if "Python" in cand_keywords or "Machine Learning" in cand_keywords:
        tech.append("Explain the mathematical foundations of gradient descent. How do you address overfitting issues in deep neural networks?")
        
    if len(tech) < 3:
        tech.append("Describe the core differences between REST APIs and gRPC. Under what architectures is gRPC superior?")
        tech.append("How do you design a database layer to prevent write race conditions under high concurrency?")
        tech.append("What is your strategy for maintaining 90% unit test coverage without slowing down feature delivery cycles?")
        
    project = [
        "Select a complex project you engineered. What was the underlying system design architecture, what bottlenecks occurred, and how would you refactor it today?",
        "How do you handle technical debt, codebase refactoring, and code consistency reviews in a collaborative development team?",
        "How do you structure database migration scripts (e.g. Liquibase or Flyway) to ensure zero-downtime rollbacks in production?"
    ]
    
    role = [
        f"As a {job_title}, describe your method for locating backend/frontend performance bottlenecks. What latency profiling tools do you use?",
        "Explain how you design authentication protocols (such as OAuth2, OpenID, or JWT tokens) to secure public API endpoints.",
        "How do you configure CI/CD deployment pipelines (GitHub Actions, Jenkins) to ensure safe, automated staging-to-production promotions?"
    ]
    
    return jsonify({
        "hrQuestions": hr,
        "technicalQuestions": tech[:4],
        "projectQuestions": project,
        "roleQuestions": role
    })

@app.route('/roadmap', methods=['POST'])
def roadmap():
    data = request.get_json() or {}
    skills_str = data.get('candidate_skills', '')
    cand_keywords = set(extract_keywords(skills_str))
    
    archetypes = {
        "Frontend Developer": {
            "keywords": {"React", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Angular", "Vue", "Next.js", "GraphQL"},
            "core": ["TypeScript", "React", "Next.js", "Tailwind CSS", "Jest", "GraphQL", "System Design"]
        },
        "Backend Systems Engineer": {
            "keywords": {"Java", "Spring Boot", "Spring", "Python", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Kafka", "Microservices", "REST API"},
            "core": ["Java", "Spring Boot", "PostgreSQL", "Redis", "Kafka", "Docker", "Microservices", "System Design"]
        },
        "Cloud & DevOps Engineer": {
            "keywords": {"Docker", "Kubernetes", "Terraform", "AWS", "Jenkins", "GitHub Actions", "CI/CD", "Git"},
            "core": ["Git", "Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "System Design"]
        },
        "Data Science & AI Engineer": {
            "keywords": {"Python", "Machine Learning", "Data Science", "TensorFlow", "PyTorch", "Scikit-Learn"},
            "core": ["Python", "Data Science", "Scikit-Learn", "Machine Learning", "PyTorch", "AWS", "System Design"]
        }
    }
    
    chosen_archetype = "Full-Stack Software Engineer"
    max_overlap = -1
    full_stack_core = ["TypeScript", "React", "Spring Boot", "PostgreSQL", "Redis", "Docker", "CI/CD", "System Design"]
    chosen_core = full_stack_core
    
    for name, info in archetypes.items():
        overlap = len(cand_keywords.intersection(info["keywords"]))
        if overlap > max_overlap and overlap > 0:
            max_overlap = overlap
            chosen_archetype = name
            chosen_core = info["core"]
            
    has_frontend = len(cand_keywords.intersection(archetypes["Frontend Developer"]["keywords"])) > 0
    has_backend = len(cand_keywords.intersection(archetypes["Backend Systems Engineer"]["keywords"])) > 0
    if has_frontend and has_backend:
        chosen_archetype = "Full-Stack Software Engineer"
        chosen_core = full_stack_core
        
    missing_skills = [skill for skill in chosen_core if skill not in cand_keywords]
    
    skills_roadmap_details = {
        "TypeScript": {
            "step": "Phase 1: Strict Static Typing with TypeScript",
            "duration": "2 Weeks",
            "topics": "Types vs interfaces, generics, strict configurations, mapped utility types, and compiler operations.",
            "resources": "TypeScript Handbook, TypeScript Deep Dive documentation.",
            "project": "Refactor a dynamic JavaScript application to strictly-typed, compiler-safe TypeScript modules."
        },
        "React": {
            "step": "Phase 2: Component-Driven Frontend Development with React",
            "duration": "3 Weeks",
            "topics": "Functional lifecycle Hooks, custom Hooks, State management (Redux Toolkit), and code-splitting lazy loading.",
            "resources": "React.dev documentation, Kent C. Dodds React guidelines.",
            "project": "Design a complete responsive telemetry user dashboard console mapping dynamic charts."
        },
        "Next.js": {
            "step": "Phase 3: Server-Side Rendering with Next.js App Router",
            "duration": "3 Weeks",
            "topics": "React Server Components, nested file routing, server actions, client page caching, and SEO optimization.",
            "resources": "Nextjs.org/learn, Vercel Core Web Vitals tutorials.",
            "project": "Convert a single-page client site into a highly optimized, server-rendered Next.js catalog site."
        },
        "Tailwind CSS": {
            "step": "Phase 1: Utility-First CSS Styling with Tailwind",
            "duration": "1 Week",
            "topics": "Utility structure, responsive configuration mappings, customized theme styling, and compilation file pruning.",
            "resources": "TailwindCSS docs, Tailwind Labs tutorials.",
            "project": "Refactor a bloated custom CSS template layout into responsive, styled Tailwind design tokens."
        },
        "Java": {
            "step": "Phase 1: Advanced Java Core Programming",
            "duration": "2 Weeks",
            "topics": "Multithreaded execution, Streams API, Lambda syntax structures, collections framework, and JVM Garbage Collection.",
            "resources": "Oracle Java Tutorials, Baeldung Java guides.",
            "project": "Create a multi-threaded server utility checking log parser buffers in real time."
        },
        "Spring Boot": {
            "step": "Phase 2: RESTful Microservices with Spring Boot",
            "duration": "3 Weeks",
            "topics": "Spring container Core, Dependency Injection, REST endpoints, Spring Data JPA mappings, and security integrations.",
            "resources": "Baeldung Spring Boot, Spring.io guides.",
            "project": "Build a secure REST API complete with JWT authorization, dynamic endpoints, and query handlers."
        },
        "PostgreSQL": {
            "step": "Phase 2: Relational Schema Design & Index Optimizations",
            "duration": "2 Weeks",
            "topics": "Database normalization, foreign key constraints, composite index scopes, transaction isolations, and pool optimizations.",
            "resources": "Use The Index Luke database tutorials, pgAcademy tracks.",
            "project": "Audit and restructure a slow transactional database layout to achieve 3x throughput improvements."
        },
        "Redis": {
            "step": "Phase 2: High-Performance Caching & Session Stores (Redis)",
            "duration": "2 Weeks",
            "topics": "Cache-aside architectures, key TTL expiration policies, Redis data types, and cache invalidation strategies.",
            "resources": "Redis University, Redis official guides.",
            "project": "Integrate a Redis caching middleware in front of a slow external API to speed up responses by 10x."
        },
        "Kafka": {
            "step": "Phase 3: Event-Driven Architectures with Apache Kafka",
            "duration": "3 Weeks",
            "topics": "Producer/Consumer models, message queue partition systems, event logs, consumer groupings, and transaction limits.",
            "resources": "Confluent Developer University tracks, Designing Data-Intensive Applications.",
            "project": "Build an asynchronous auditing system powered by Kafka broker queues and consumer workers."
        },
        "Docker": {
            "step": "Phase 2: SaaS Containerization & Orchestrated Builds",
            "duration": "2 Weeks",
            "topics": "Writing efficient Dockerfiles, multi-stage compilation builds, network containers, and compose coordinates.",
            "resources": "Docker curriculum documentation, TechWorld with Nana guides.",
            "project": "Write multi-stage Dockerfiles for backend and frontend apps, tying them together in Docker Compose."
        },
        "Kubernetes": {
            "step": "Phase 3: Automated Microservices Orchestration (Kubernetes)",
            "duration": "3 Weeks",
            "topics": "Pods, Deployments, service load balancers, Ingress routes, ConfigMaps, Secrets, and rolling updates.",
            "resources": "Kubernetes.io tutorial documents, Nana Janashia K8s roadmap.",
            "project": "Deploy a containerized application stack to a local Minikube cluster with active load balancers."
        },
        "CI/CD": {
            "step": "Phase 3: Build Pipelines & Continuous Deployment Automation",
            "duration": "2 Weeks",
            "topics": "GitHub Actions yaml scripts, runner environments, test suite validations, and server deployments.",
            "resources": "GitHub Actions Learning Pathways, CI/CD guides.",
            "project": "Set up an automated workflow compiling, testing, and pushing container images to a Docker Registry."
        },
        "System Design": {
            "step": "Phase 3: Distributed System Architectures & Scaling",
            "duration": "3 Weeks",
            "topics": "Load balancing, vertical/horizontal scaling, CAP theorem, database sharding, caching, and rate limiting.",
            "resources": "Designing Data-Intensive Applications, ByteByteGo blueprints.",
            "project": "Draft a detailed system architecture design to support 5 million daily active users."
        }
    }
    
    learning_path = []
    if not missing_skills:
        learning_path = [
            {
                "step": "Phase 1: Cloud-Native Microservice Security",
                "duration": "3 Weeks",
                "topics": "Mutual TLS, service mesh networks (Istio), API security protection, and centralized vaulting.",
                "resources": "Istio.io tutorials, HashiCorp Vault documentation.",
                "project": "Integrate HashiCorp Vault secrets injection and Istio mutual TLS inside a K8s cluster."
            },
            {
                "step": "Phase 2: Event-Driven Event Sourcing & High-Throughput Streams",
                "duration": "4 Weeks",
                "topics": "Event-driven system design, CQRS, Apache Kafka, event store log compaction, and idempotent consumers.",
                "resources": "Confluent developer guides, EventSourcing blueprints.",
                "project": "Build a transactional audit system using Kafka streams and a CQRS event store database."
            },
            {
                "step": "Phase 3: Multi-Region High-Availability Infrastructure Deployment",
                "duration": "4 Weeks",
                "topics": "Multi-region active-active cloud hosting, DNS geo-routing, global databases (Aurora Global), and canary deployments.",
                "resources": "AWS Architecture Center frameworks, SRE books.",
                "project": "Configure a multi-region deployment template automating canary rollouts with zero downtime."
            }
        ]
        recommended_skills = ["Istio", "HashiCorp Vault", "GraphQL", "System Design"]
    else:
        for idx, skill in enumerate(missing_skills[:3]):
            if skill in skills_roadmap_details:
                detail = skills_roadmap_details[skill]
                learning_path.append({
                    "step": detail["step"],
                    "duration": detail["duration"],
                    "topics": detail["topics"],
                    "resources": detail["resources"],
                    "project": detail["project"]
                })
            else:
                learning_path.append({
                    "step": f"Phase {idx + 1}: Master {skill}",
                    "duration": "3 Weeks",
                    "topics": f"Core syntax, API interfaces, integration setups, execution profiles, and unit test validations.",
                    "resources": f"Official {skill} developer documentation and industry tutorials.",
                    "project": f"Create a sample application leveraging {skill} that integrates with a database layer."
                })
                
        fillers = ["System Design", "Docker", "CI/CD"]
        for fill in fillers:
            if len(learning_path) < 3 and fill not in cand_keywords:
                detail = skills_roadmap_details[fill]
                learning_path.append({
                    "step": f"Phase {len(learning_path) + 1}: {detail['step'].split(': ')[1]}",
                    "duration": detail["duration"],
                    "topics": detail["topics"],
                    "resources": detail["resources"],
                    "project": detail["project"]
                })
                
        while len(learning_path) < 3:
            learning_path.append({
                "step": f"Phase {len(learning_path) + 1}: System Testing & Code Quality Assurance",
                "duration": "2 Weeks",
                "topics": "Unit testing frameworks, integration mock assertions, security configurations, and dependency updates.",
                "resources": "OWASP Secure Coding standard docs.",
                "project": "Integrate security scanners and test coverage trackers inside your GitHub repository."
            })
            
        recommended_skills = [s for s in chosen_core if s not in cand_keywords]
        if not recommended_skills:
            recommended_skills = ["Docker", "Kubernetes", "System Design"]
            
    return jsonify({
        "currentSkills": list(cand_keywords),
        "recommendedSkills": recommended_skills[:5],
        "learningPath": learning_path
    })

@app.route('/candidate-insights', methods=['POST'])
def candidate_insights():
    data = request.get_json() or {}
    skills_str = data.get('candidate_skills', '')
    experience = data.get('experience', '')
    job_skills_str = data.get('job_skills', '')
    job_desc = data.get('job_description', '')
    
    cand_metadata = parse_resume_metadata(skills_str, experience, "")
    job_keywords = set(extract_keywords(job_skills_str + " " + job_desc))
    cand_keywords = cand_metadata["skills"]
    
    years_exp = cand_metadata["years_experience"]
    if years_exp >= 5 or any(w in experience.lower() for w in ["lead", "architect", "principal", "senior"]):
        career_level = "Senior / Lead Engineer"
    elif years_exp >= 3:
        career_level = "Mid-Level Professional"
    else:
        career_level = "Junior / Entry Level"
        
    strengths = []
    overlap = cand_keywords & job_keywords
    if overlap:
        strengths.append(f"Technical Stack Alignment: Candidate possesses direct experience in required technologies: {', '.join(list(overlap)[:3])}.")
    if years_exp >= 5:
        strengths.append(f"Seniority & Stability: Demonstrates a solid engineering track record with over {years_exp} years of history.")
    elif years_exp >= 1:
        strengths.append(f"Engineering Base: Possesses {years_exp} years of active workspace experience.")
        
    if len(cand_metadata["action_verbs"]) >= 3:
        strengths.append("High Execution Depth: Previous descriptions start with action-oriented verbs, suggesting strong delivery ownership.")
    if len(cand_metadata["metrics"]) > 0:
        strengths.append("Business & Impact Awareness: Outline references quantitative metrics (e.g. scale optimizations or cost savings), proving impact focus.")
    if cand_metadata["certifications"]:
        strengths.append(f"Professional Credentials: Profile verified by industry certifications: {', '.join(cand_metadata['certifications'][:2])}.")
        
    if not strengths:
        strengths.append("Standard developer profile covering basic software engineering operations.")
        
    weaknesses = []
    missing = [s for s in job_keywords if s not in cand_keywords]
    if missing:
        weaknesses.append(f"Framework & Tool Alignment Gaps: Missing key frameworks specified in job posting: {', '.join(missing[:3])}.")
    if years_exp < 3 and "senior" in (job_desc + " " + job_skills_str).lower():
        weaknesses.append("Seniority Deficit: Candidate's years of experience is below the expected seniority level for a Senior/Lead engineer.")
    if len(cand_metadata["metrics"]) == 0:
        weaknesses.append("Lack of Quantitative Metrics: Work history is descriptive but does not verify efficiency metrics, throughput, or team sizes.")
    if not cand_metadata["contact"]["linkedin"] and not cand_metadata["contact"]["github"]:
        weaknesses.append("Portfolio Profiles Missing: Lacks professional links (LinkedIn/GitHub) to audit codebase quality or engineering history.")
        
    if not weaknesses:
        weaknesses.append("No critical technology gaps or structural defects identified. Candidate details align completely with target post.")

    match_score = calculate_match_score(skills_str, job_skills_str + " " + job_desc)
    
    if match_score >= 85.0:
        fit_category = "Strong Hire"
        reasons = [
            f"High match score of {match_score}% indicating excellent semantic stack overlap.",
            "Possesses core technologies required by the role.",
            "Quantified business achievements and action-oriented work descriptions.",
            "Strong career seniority alignment."
        ]
    elif match_score >= 65.0:
        fit_category = "Hire"
        reasons = [
            f"Solid score of {match_score}% showing strong alignment with core requirements.",
            "Candidate is familiar with the technical family; minor adjacent skills can be learned during onboarding.",
            "Detailed work history demonstrating project execution."
        ]
    elif match_score >= 50.0:
        fit_category = "Consider"
        reasons = [
            "Moderate alignment showing framework gaps.",
            "Possesses foundational software development skills but lacks targeted tools.",
            "Recommend screening for study capacity and technical agility."
        ]
    else:
        fit_category = "Weak Fit"
        reasons = [
            f"Match rating of {match_score}% sits below target hiring bar.",
            "Lacks core technologies and frameworks required by the team.",
            "Work history does not align with the seniority level or engineering parameters of this posting."
        ]
        
    rec_text = f"{fit_category}: " + (reasons[0] if reasons else "Profile matches core requirements.")
    
    learning_recs = []
    for skill in missing[:3]:
        learning_recs.append(f"Learn {skill} and build a portfolio project applying its architectural patterns.")
    if not learning_recs:
        learning_recs.append("Candidate is fully aligned. Recommend exploring system scaling and server reliability architectures.")

    return jsonify({
        "strengths": strengths,
        "weaknesses": weaknesses,
        "missingSkills": missing,
        "matchScore": match_score,
        "hiringRecommendation": rec_text,
        "careerLevelAssessment": career_level,
        "hiringRecommendationCategory": fit_category,
        "hiringRecommendationReasons": reasons,
        "learningRecommendations": learning_recs
    })

@app.route('/job-insights', methods=['POST'])
def job_insights():
    data = request.get_json() or {}
    title = data.get('title', 'Software Engineer')
    skills = data.get('skills', '')
    description = data.get('description', '')
    
    keywords = extract_keywords(description + " " + skills)
    
    missing_reqs = []
    keywords_suggested = []
    description_tips = []
    skill_recs = []
    
    lower_title = title.lower()
    if "backend" in lower_title or "java" in lower_title or "boot" in lower_title:
        target_skills = ["Spring Boot", "REST API", "PostgreSQL", "Docker", "CI/CD", "System Design", "Redis", "Kafka"]
        for s in target_skills:
            if s not in keywords:
                missing_reqs.append(f"Consider specifying '{s.upper()}' to attract backend systems engineers.")
                keywords_suggested.append(s)
        description_tips.append("Detail database query optimization methods, microservices discovery layers, and server safety patterns.")
        skill_recs = ["Spring Boot", "Docker", "PostgreSQL", "System Design"]
    elif "frontend" in lower_title or "react" in lower_title or "ui" in lower_title:
        target_skills = ["React", "TypeScript", "Tailwind CSS", "Jest", "Next.js", "GraphQL"]
        for s in target_skills:
            if s not in keywords:
                missing_reqs.append(f"Consider specifying '{s.upper()}' to attract modern frontend developers.")
                keywords_suggested.append(s)
        description_tips.append("Outline responsive client state configurations, custom Hooks structures, and client page loading optimizations.")
        skill_recs = ["React", "TypeScript", "Next.js", "Jest"]
    else:
        target_skills = ["React", "Spring Boot", "PostgreSQL", "Docker", "Git", "CI/CD", "System Design"]
        for s in target_skills:
            if s not in keywords:
                missing_reqs.append(f"Mention '{s.upper()}' to ensure end-to-end full stack developer alignment.")
                keywords_suggested.append(s)
        description_tips.append("Specify duties across both frontend user interfaces and server data processing pipelines.")
        skill_recs = ["Spring Boot", "React", "Docker", "System Design"]
        
    if len(description.strip()) < 150:
        description_tips.append("The job description is brief. Expand daily team duties and project goals to improve visibility to senior candidates.")
        
    if not missing_reqs:
        missing_reqs.append("No critical missing keywords. Job posting is highly optimized.")
        
    return jsonify({
        "missingRequirements": missing_reqs,
        "keywordsSuggested": keywords_suggested if keywords_suggested else ["Git", "Jest", "REST API"],
        "descriptionTips": description_tips,
        "skillRecommendations": skill_recs
    })

@app.route('/optimize-jd', methods=['POST'])
def optimize_jd():
    data = request.get_json() or {}
    title = data.get('title', 'Software Engineer')
    description = data.get('description', '')
    skills = data.get('skills', '')
    
    optimized_desc = f"""Role Overview:
We are seeking an experienced, growth-oriented {title} to join our high-performing engineering team. In this role, you will design, engineer, and deploy highly scalable, reliable, and secure software applications, contributing to core product features and pipeline automation.

Key Responsibilities:
- Architect, build, and optimize high-throughput RESTful services and APIs.
- Collaborate with agile cross-functional engineering teams to deliver robust features under continuous delivery iterations.
- Write clean, maintainable, and testable code with high unit and integration test coverages.
- Proactively identify bottlenecks in data query pipelines, server latency profiles, and API gateway routes.

Ideal Professional Profile:
- Strong engineering background writing production-grade modules with strict coding standards.
- Solid familiarity with the core technology stack: {skills if skills else 'modern programming languages and adjacent tools'}.
- Hands-on experience containerizing services (Docker, Kubernetes) and deploying pipelines via CI/CD.
- Strong system design thinking, problem-solving capabilities, and a collaborative team attitude.
"""
    return jsonify({
        "optimizedDescription": optimized_desc,
        "suggestedSkills": ["Git", "REST API", "System Design", "Docker", "JUnit/Jest"]
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'running', 'service': 'AI Matching Engine'})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
