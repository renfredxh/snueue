import snueue
import unittest

class TestViews(unittest.TestCase):

    def setUp(self):
        snueue.app.config.from_object('snueue.config.development')
        snueue.app.config['TESTING'] = True
        self.app = snueue.app.test_client()

    def test_index(self):
        resp = self.app.get('/')
        self.assertEqual(resp.status_code, 200)

if __name__ == '__main__':
    unittest.main()
