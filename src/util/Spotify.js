// TODO: Get Client ID from https://developer.spotify.com/dashboard/ and put it here
const clientId = '420d4cb4103c4441a013e2ab81363577';
const redirectUri = 'http://localhost:3000/'
let accessToken;

// const redirectUri = 'http://localhost:3000/';
// const spotifyUrl = `https://accounts.spotify.com/authorize?response_type=token&scope=playlist-modify-public&client_id=${clientId}&redirect_uri=${redirectUri}`;
// let accessToken = undefined;
// let expiresIn = undefined;

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessToken && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);

      expiresIn = urlExpiresIn[1];
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`
      window.location = accessUrl;
    }
  },

  search(term) {
    const accessToken = Spotify.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,
    {headers:{
      Authorization:`Bearer ${accessToken}`
    }
   }).then(response => {
     return response.json();
   }).then(jsonResponse => {
     if (!jsonResponse.tracks) {
       return [];
     }
     return jsonResponse.tracks.items.map(track => ({
       id: track.id,
       name: track.name,
       artist: track.artists[0].name,
       album: track.album.name,
       uri: track.uri
     }));
   });
  },
  
  savePlaylist(name, trackUris) {
    if (!name || trackUris.length ) {
      return;
    }

    const accessToken = Spotify.getAccessToken();
    const headers = {Authorization: `Bearer ${accessToken}`};
    let userId;

    return fetch('https://api.spotify.com/v1/me', {headers: headers}
    ).then(response => response.json()
    ).then(jsonResponse => {
      userId = jsonResponse.id;
      return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, 
      {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({name: name})
      }).then(response => response.json()
      ).then(jsonResponse => {
        const playlistId = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/{user_id}/playlists/{playlist_id}/tracks`,{
          headers: headers,
          method: 'POST',
          body: JSON.stringify({uris: trackUris})
        })
      })
    })
  }
  }


//   async search(term) {
//     const searchUrl = `https://api.spotify.com/v1/search?type=track&q=${term.replace(' ', '%20')}`;
//     return fetch(searchUrl, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     })
//       .then((response) => response.json())
//       .then((jsonResponse) => {
//         if (!jsonResponse.tracks) return [];
//         return jsonResponse.tracks.items.map((track) => {
//           return {
//             id: track.id,
//             name: track.name,
//             artist: track.artists[0].name,
//             album: track.album.name,
//             uri: track.uri,
//           };
//         });
//       });
//   },

//   async savePlaylist(name, trackIds) {
//     if (Array.isArray(trackIds) && trackIds.length) {
//       const createPlaylistUrl = `https://api.spotify.com/v1/me/playlists`;
//       const response = await fetch(createPlaylistUrl, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify({
//           name: name,
//           public: true,
//         }),
//       });
//       const jsonResponse = await response.json();
//       const playlistId = jsonResponse.id;
//       if (playlistId) {
//         const replacePlaylistTracksUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
//         await fetch(replacePlaylistTracksUrl, {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${accessToken}`,
//           },
//           body: JSON.stringify({
//             uris: trackIds.map((id) => 'spotify:track:'.concat(id)),
//           }),
//         });
//       }
//     }
//   },
// };

export default Spotify;
