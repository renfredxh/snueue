import copy
import unittest
from unittest.mock import Mock, patch, create_autospec, call

from redis import StrictRedis
from redis.client import StrictPipeline

import snueue
from snueue.models import RedisModel
from snueue.services import database

@patch('snueue.services.database.get_db',
       return_value=create_autospec(StrictRedis))
class TestDatabase(unittest.TestCase):

    def setUp(self):
        snueue.app.config['TESTING'] = True

    def test_format_key(self, get_mock_db):
        key = database.format_key('genre', 'jazz')
        self.assertEqual(key, 'genre:jazz')

    def test_get(self, get_mock_db):
        mock_db = get_mock_db()
        mock_db.get.return_value = 'edm'
        val = database.get('artist', 'Deadmau5')
        self.assertEqual(val, 'edm')
        mock_db.get.assert_called_once_with('artist:Deadmau5')

    def test_get_model(self, get_mock_db):
        class Artist(RedisModel):
            model_name = 'artist'
            model_fields = ('genre', 'location')
            model_sets = ('members', 'albums')
        fields = {'genre': 'Rock', 'location': 'Detroit'}
        sets = [{'Jack White', 'Meg White'}, {'Elephant'}]
        mock_db = get_mock_db()
        mock_db.hgetall.return_value = fields
        mock_db.smembers.side_effect = sets
        val = database.get(Artist, 'TheWhiteStripes')
        mock_db.hgetall.assert_called_once_with('artist:TheWhiteStripes')
        self.assertEqual(val.genre, fields['genre'])
        self.assertEqual(val.location, fields['location'])
        self.assertEqual(val.members, sets[0])
        self.assertEqual(val.albums, sets[1])

    def test_set(self, get_mock_db):
        mock_db = get_mock_db()
        database.set('guitar', 'Eastwood-Airline', '$799')
        mock_db.set.assert_called_once_with('guitar:Eastwood-Airline', '$799')
        database.set('guitar', 'Stratocaster', '$1,449', expiration=81)
        mock_db.setex.assert_called_once_with('guitar:Stratocaster', 81, '$1,449')

    def test_save(self, get_mock_db):
        class Artist(RedisModel):
            model_name = 'artist'
            model_fields = ('genre', 'location')
            model_sets = ('albums',)
        mock_db = get_mock_db()
        mock_pipe = create_autospec(StrictPipeline)
        mock_db.smembers.side_effect = [set()]
        mock_db.pipeline.return_value = mock_pipe
        data = {'genre': 'Alternative'}
        artist = Artist('Paramore', data.copy())
        location, albums = 'Franklin', {'All We Know Is Falling', 'Riot'}
        artist.location, artist.albums = location, albums
        database.save(artist)
        mock_pipe.hmset.assert_called_once_with(
            'artist:Paramore', {'location': 'Franklin'}
        )
        mock_pipe.sadd.assert_has_calls([
            call('artist:Paramore:albums', album) for album in albums
        ], any_order=True)
        self.assertTrue(mock_pipe.execute.called)
        # Make sure the model's fields weren't changed by the save method.
        self.assertEqual(artist.genre, data['genre'])
        self.assertEqual(artist.location, location)
        self.assertEqual(artist.albums, albums)

    def test_save_sets(self, get_mock_db):
        class Artist(RedisModel):
            model_name = 'artist'
            model_sets = ('members',)
        mock_db = get_mock_db()
        mock_pipe = create_autospec(StrictPipeline)
        members = {
            'Hayley Williams', 'Jeremy Davis',
            'Josh Farro', 'Zac Farro'
        }
        mock_db.smembers.side_effect = [members]
        mock_db.pipeline.return_value = mock_pipe
        artist = Artist('Paramore', {'members': members.copy()})
        added, removed = {'Taylor York', 'Justin York'}, {'Josh Farro', 'Zac Farro'}
        artist.members.update(added)
        artist.members.difference_update(removed)
        database.save(artist)
        mock_pipe.sadd.assert_has_calls([
            call('artist:Paramore:members', member) for member in added
        ], any_order=False)
        mock_pipe.srem.assert_has_calls([
            call('artist:Paramore:members', member) for member in removed
        ], any_order=False)
        self.assertTrue(mock_pipe.execute.called)

    def test_delete(self, get_mock_db):
        mock_db = get_mock_db()
        database.delete('subscriptions', 'Kerrang!')
        mock_db.delete.assert_called_once_with('subscriptions:Kerrang!')

if __name__ == '__main__':
    unittest.main()
