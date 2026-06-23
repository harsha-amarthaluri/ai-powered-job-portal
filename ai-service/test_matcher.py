import unittest
import numpy as np
from unittest.mock import patch
import app

class MockModel:
    def __init__(self, vector=None):
        self.vector = vector if vector is not None else np.ones(384, dtype=np.float32)
        
    def encode(self, text, convert_to_numpy=True):
        # Return specific vectors to test similarity scores
        if "java" in text:
            vec = np.zeros(384, dtype=np.float32)
            vec[0] = 1.0
            return vec
        elif "c" in text:
            vec = np.zeros(384, dtype=np.float32)
            vec[1] = 1.0
            return vec
        return self.vector

class TestResumeMatcher(unittest.TestCase):
    def setUp(self):
        # Clear cache before each test to ensure isolation
        with app.cache_lock:
            app.EMBEDDING_CACHE.clear()

    def test_calculate_match_score_basic(self):
        # Test semantic match score
        skills = "python java machine learning aws docker"
        jd = "We are looking for a software engineer proficient in Python, Java, and AWS. Docker experience is a plus."
        score = app.calculate_match_score(skills, jd)
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 100.0)
        self.assertIsInstance(score, float)

    def test_calculate_match_score_empty(self):
        # Empty inputs should return 0.0
        self.assertEqual(app.calculate_match_score("", "some jd"), 0.0)
        self.assertEqual(app.calculate_match_score("python", ""), 0.0)
        self.assertEqual(app.calculate_match_score("", ""), 0.0)

    def test_fallback_to_tfidf(self):
        # Set app.model to None to force TF-IDF fallback
        original_model = app.model
        app.model = None
        try:
            skills = "python java machine learning aws docker"
            jd = "We are looking for a software engineer proficient in Python, Java, and AWS. Docker experience is a plus."
            score = app.calculate_match_score(skills, jd)
            self.assertGreaterEqual(score, 0.0)
            self.assertLessEqual(score, 100.0)
            self.assertIsInstance(score, float)
        finally:
            app.model = original_model

    def test_cache_hits(self):
        # Verify that caching works and returns identical scores
        skills = "react spring boot kubernetes postgresql"
        jd = "Looking for a full stack developer with react, spring boot, and kubernetes experience."
        
        # Prime cache
        score1 = app.calculate_match_score(skills, jd)
        
        # Second execution should hit cache and yield identical results
        score2 = app.calculate_match_score(skills, jd)
        self.assertEqual(score1, score2)

    def test_semantic_match_with_mock_model(self):
        # Verify cosine similarity math inside calculate_match_score when model is present
        original_model = app.model
        app.model = MockModel()
        try:
            # Strong match with matching skills, experience, and project info
            score_perfect = app.calculate_match_score(
                "java candidate with 3 years experience and portfolio project on github.com",
                "java developer with spring boot background"
            )
            self.assertGreaterEqual(score_perfect, 85.0)

            # Weak match with orthogonal tech stacks
            score_orthogonal = app.calculate_match_score("java", "c++ developer")
            self.assertLess(score_orthogonal, 65.0)
        finally:
            app.model = original_model

if __name__ == '__main__':
    unittest.main()
