import * as dotenv from 'dotenv';
import { PrivateConfig } from 'src/interfaces/Config';
import { BadRequestError, NotFoundError } from 'src/interfaces/Errors';
import { describe, expect, test } from 'vitest';
import { AlbumManager } from './AlbumManager';

dotenv.config();

const api = {
  clientCredentials: {
    clientId: process.env?.SPOTIFY_CLIENT_ID,
    clientSecret: process.env?.SPOTIFY_CLIENT_SECRET
  }
};
const albumManager = new AlbumManager(api, new Date() as PrivateConfig);

describe('AlbumManager.get', () => {
  test('Get valid album', async () => {
    const album = await albumManager.get('3T4tUhGYeRNVUGevb0wThu');
    expect(album.id).eq('3T4tUhGYeRNVUGevb0wThu');
    expect(album.artists[0].name).eq('Ed Sheeran');
    expect(album.name).eq('÷ (Deluxe)');
    expect(album.release_date).eq('2017-03-03');
    expect(album.type).eq('album');
    expect(album.tracks.total).eq(16);
    expect(album.tracks.items.length).eq(16);
  });

  test('Get valid single album', async () => {
    const album = await albumManager.get('1IOYUjGsuwWJPchUBNwP4A');
    expect(album.id).eq('1IOYUjGsuwWJPchUBNwP4A');
    expect(album.artists[0].name).eq('Rick Astley');
    expect(album.name).eq('Lights Out');
    expect(album.release_date).eq('2010-06-07');
    expect(album.type).eq('album');
    expect(album.tracks.total).eq(1);
    expect(album.tracks.items.length).eq(1);
  });

  test('Get album with invalid ID', async () => {
    try {
      await albumManager.get('');
    } catch (error) {
      const e = error as BadRequestError;
      expect(e.name).eq('BadRequestError');
      expect(e.message).contain('"status": 400');
      expect(e.message).contain('"message": "invalid id"');
    }
  });

  test('Get non existing album', async () => {
    try {
      await albumManager.get('3T4tUhGYeRNVUGevb0wThA');
    } catch (error) {
      const e = error as NotFoundError;
      expect(e.name).eq('NotFoundError');
    }
  });
});

describe('AlbumManager.list', () => {
  test('Get 1 album in list', async () => {
    const albums = await albumManager.list(['5Z9iiGl2FcIfa3BMiv6OIw']);
    expect(albums.length).eq(1);
    expect(albums[0].name).eq('Whenever You Need Somebody');
    expect(albums[0].artists[0].name).eq('Rick Astley');
  });

  test('Get 3 albums in list', async () => {
    const albums = await albumManager.list([
      '55gMu4AvAKCbCaGv3GIXgy',
      '3diVIcNOjBrHtymSHRenUF',
      '4GaZVlUxOltAnlfWjLTWeL'
    ]);
    expect(albums.length).eq(3);
    const artist = 'John Williams';
    expect(albums[0].artists[0].name).eq(artist);
    expect(albums[1].artists[0].name).eq(artist);
    expect(albums[2].artists[0].name).eq(artist);
  });

  test('Get 22 albums in list', async () => {
    const albums = await albumManager.list([
      '4XJaXh57G3rZtAzqeVZSfn',
      '3bLAXYwCPRW9xSk91gCgOY',
      '5H9p3AIho3KHIrvr8EbKIc',
      '01cCH740dJnp3nhkWWWBzJ',
      '3f9gSNrcSQxcEjWDSbOxAK',
      '00V1MSXp0ral9K394aItww',
      '2UwZm9HOqn50LEfMb9V1pf',
      '60qUFi2mJQWWvBONczWFLa',
      '5devPxQnSKVF2Ed0CVwQZh',
      '7aBU1RPVRyTsH5T0dZMA7E',
      '7aBU1RPVRyTsH5T0dZMA7E',
      '36LddM9PpxaGUtzPPdP2x6',
      '3oF3DhWbjUiwna8tThMQCy',
      '1V2AYh4idtsw2CYlJGZNro',
      '17BaWeRJqhGTK6nnScRgws',
      '6fFzRb5gNtSZzR3I2aSLwR',
      '6BhqPpIgY83rqoZ2L78Lte',
      '4KLgKIcovn9TFD3G630Ulp',
      '7KjwEL0bOtyfrk52znavIC',
      '3bxlMAS95e1ZbBLNWDX6UZ',
      '42eusslaYHJvhxttuMbwj9',
      '7FqjYADbUVTgqKpIUbubac'
    ]);
    expect(albums.length).eq(22);
  });

  test('Get 100 of the same albums in list', async () => {
    const albums = await albumManager.list(Array(100).fill('2RHPZEe6gRPxeqj0KfV3fX'));
    expect(albums.length).eq(100);
  }, 10000);

  test('Get 1 album with invalid ID', async () => {
    try {
      await albumManager.list(['']);
    } catch (error) {
      const e = error as BadRequestError;
      expect(e.name).eq('BadRequestError');
      expect(e.message).contain('"status": 400');
      expect(e.message).contain('"message": "invalid id"');
    }
  });

  test('Get 200 albums with invalid ID', async () => {
    try {
      await albumManager.list(
        Array(200)
          .fill('')
          .map(() => String.fromCharCode(Math.floor(Math.random() * 127)))
      );
    } catch (error) {
      const e = error as BadRequestError;
      expect(e.name).eq('BadRequestError');
      expect(e.message).contain('bad request');
    }
  });

  test('Get 4 albums with 1 album ID is an invalid ID', async () => {
    try {
      await albumManager.list(['3UiJH1RrFl2KM1ijLLNqrC', '-', '0dAhuTx13ciZIXgan98X7Z']);
    } catch (error) {
      const e = error as BadRequestError;
      expect(e.name).eq('BadRequestError');
      expect(e.message).contain('"status": 400');
      expect(e.message).contain('"message": "invalid id"');
    }
  });
});

describe('AlbumManager.tracks', () => {
  test('Get valid album by ID with 20 tracks', async () => {
    const tracks = await albumManager.tracks('5Z9iiGl2FcIfa3BMiv6OIw');
    expect(tracks.items.length).eq(10);
    expect(tracks.total).eq(10);
    expect(tracks.items[0].name).eq('Never Gonna Give You Up');
    expect(tracks.href).contains('5Z9iiGl2FcIfa3BMiv6OIw');
    expect(tracks.limit).eq(20);
    expect(tracks.next).eq(null);
    expect(tracks.offset).eq(0);
    expect(tracks.previous).eq(null);
  });

  test('Get valid album by ID with "0" as options ', async () => {
    const tracks = await albumManager.tracks('3xoAUqjKs7Ps7wR26VAMbq', {
      offset: 0,
      limit: 0
    });
    expect(tracks.offset).eq(0);
    expect(tracks.total).eq(16);
    expect(tracks.limit).eq(20);
    expect(tracks.items.length).eq(16);
  });

  test('Get valid album by with 3 offset', async () => {
    const tracks = await albumManager.tracks('1qwlxZTNLe1jq3b0iidlue', {
      offset: 3
    });
    expect(tracks.offset).eq(3);
    expect(tracks.total).eq(15);
    expect(tracks.items.length).eq(12);
    expect(tracks.limit).eq(20);
  });

  test('Get valid album with limit 50 and offset 500', async () => {
    const tracks = await albumManager.tracks('0Vzr3HlSCCACpfENH4y1jC', {
      offset: 500,
      limit: 50
    });
    expect(tracks.limit).eq(50);
    expect(tracks.offset).eq(500);
    expect(tracks.total).eq(1330);
    expect(tracks.next).contains('0Vzr3HlSCCACpfENH4y1jC');
    expect(tracks.next).contains('offset=550');
    expect(tracks.next).contains('limit=50');
    expect(tracks.next).contains('0Vzr3HlSCCACpfENH4y1jC');
    expect(tracks.previous).contains('offset=450');
    expect(tracks.previous).contains('limit=50');
    expect(tracks.items.length).eq(50);
  });

  test('Get valid album with limit 51', async () => {
    try {
      await albumManager.tracks('6LW1VUihmMg6qAM3tUPXFe', { limit: 51 });
    } catch (error) {
      const e: BadRequestError = error;
      expect(e.name).eq('BadRequestError');
      expect(e.message).contains('Invalid limit, cannot be greater than 50');
    }
  });
});
