import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [players, setPlayers] = useState(null);

  useEffect(() => {
    fetch('http://192.168.0.29:8080/get_all_players')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => setPlayers(data))
      .catch((error) => console.error('Error fetching players:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>報名清單(測試)</h1>
        {players ? (
          <div>
          <table style={{ borderCollapse: 'collapse', width: '80%', margin: 'auto' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>/</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Discord頭像</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Discord名稱</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Minecraft頭像</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Minecraft名稱</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>玩家分組</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>報名者資訊{index+1}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <img
                      src={player.avatar_url}
                      alt={`${player.discord_username}'s Discord Avatar`}
                      style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                    />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.discord_username}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <img
                      src={`https://crafatar.com/avatars/${player.minecraft_player_uuid}?size=50&overlay`}
                      alt={`${player.minecraft_player}'s Minecraft Avatar`}
                      style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                    />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.minecraft_player}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.groups === '0' ? '未分組' : player.groups}</td>
                  <button onClick={fetchPlayers} style={{ marginBottom: '20px', padding: '10px 20px', fontSize: '16px' }}></button>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={fetchPlayers} style={{ marginBottom: '20px', padding: '10px 20px', fontSize: '16px' }}>
          submit changes
          </button>
          </div>
        ) : (
          <p>Loading players...</p>
        )}
      </header>
    </div>
  );
}

export default App;