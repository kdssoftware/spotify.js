import { PrivateConfig } from 'src/interfaces/Config';
import { BadRequestError, NotFoundError } from 'src/interfaces/Errors';
import { describe, expect, test } from 'vitest';
import { AlbumManager } from './AlbumManager';

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
  });

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
