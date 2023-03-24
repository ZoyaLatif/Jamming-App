

const clientId = 'your client id';
const redirectUri = 'http://localhost:3000/callback/';


let accessToken;


console.log(clientId)

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }
// check for access token match
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expireTokenMatch = window.location.href.match(/expires_in=([^&]*)/);

        if(accessTokenMatch && expireTokenMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expireTokenMatch[1]);
            //accessToken = accessToken.replace('=', '');

            // Clear the parameteters, allowing us to grap new access token when it expires
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accessUrl;
        }

    },
//84 , 86 steps
   search(term) {
        const accessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,
            {
                headers: {Authorization: `Bearer ${accessToken}`}
            }).then(response => {
                return response.json();
            }).then(jsonResponse => {
                if(!jsonResponse.tracks) {
                    return [];
                }

                return jsonResponse.tracks.items.map(track => (
                    {
                        id: track.id,
                        name: track.name,
                        artists: track.artists[0].name,
                        album: track.album.name,
                        uri: track.uri

                    })
                );
            })
    },
//step 90
    savePlaylist(name, trackUris) {
        if(!name || !trackUris.length) {
            return;
        }

        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}`};
        let userId;

        // Get userid
        return fetch('https://api.spotify.com/v1/me', { headers: headers }
        ).then(response => response.json()
        ).then(jsonResponse => {
            userId = jsonResponse.id;
            // Create PlayList and return id for playList
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, 
            {
                headers: headers,   
                method: 'POST',
                body: JSON.stringify({name: name})
            }).then(response => response.json()
            ).then(jsonResponse => {
                const playlistId = jsonResponse.id;
                // Add tracks to playList
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris: trackUris})
                })
            })
            
        })
    }
}

export default Spotify;
