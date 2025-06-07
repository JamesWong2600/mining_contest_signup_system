import React, { useState, useEffect } from 'react';
import './App.css';
//import config from './config.json';
import superagent from 'superagent';



function App() {
  const [players, setPlayers] = useState(null);
  const [isPermittedUser, setIsPermittedUser] = useState(false); // Track LAN mode globally
  const [editmode, setEditMode] = useState(false); // Track edit mode globally
  const [formData, setFormData] = useState({}); // Track form data for editing
    useEffect(() => {
    const fetchPlayers = async () => {
      /*fetch(`${config.apiBaseUrl}/get_all_players`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          setPlayers(data.players);
          setIsPermittedUser(data.PermittedUser); // Check if isLan is true or false
          if (Array.isArray(data) && data.length > 0) {
            setIsPermittedUser(data[0].PermittedUser === "true");
          }
          console.log('PermittedUser:', isPermittedUser);
        })
        .catch((error) => console.error('Error fetching players:', error));*/
    try {
        const userIp = await fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip);

        console.log('User IP:', userIp); // Log the user's IP address

      const response = await superagent
        .get('/api/get_all_players')
        .set('X-Forwarded-For', userIp) // Use the /api prefix
        .set('Accept', 'application/json');

        const data = response.body; // Access the parsed JSON response
        setPlayers(data.players);
        setIsPermittedUser(data.PermittedUser);
        console.log('Fetched players:', data.players);
      } catch (error) {
        console.error('Error fetching players:', error.message);
      }
    };

    // Fetch players every second
    const intervalId = setInterval(fetchPlayers, 2000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleEditChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };
  
const handleClick = async (index) => {
  const userIp = await fetch('https://api.ipify.org?format=json')
  .then((res) => res.json())
  .then((data) => data.ip);

  const userInput = prompt("請輸入passcode");
  if (!userInput) return; // Exit if no input is provided

  const jsonData = {
    passcode: userInput,
  };

  try {
    const response = await superagent
      .post('/api/check_auth') // Use the /api prefix for the proxy
      .send(jsonData) // Send the JSON payload
      .set('X-Forwarded-For', userIp)
      .set('Accept', 'application/json'); // Set headers if needed

    const data = response.body; // Access the parsed JSON response

    if (data.isAuthorized) {
      handleSave(index);
      console.log('Edit saved successfully for player at index:', index);
    } else {
      alert('Unauthorized access. Please try again.');
      console.log('Unauthorized access attempt with passcode:', userInput);
    }
  } catch (error) {
    console.error('Error saving player:', error.message);
  }
};

  const handleDeleteClick = async (index) => {
  const userIp = await fetch('https://api.ipify.org?format=json')
  .then((res) => res.json())
  .then((data) => data.ip);

  const userInput = prompt("請輸入passcode");
  if (!userInput) return; // Exit if no input is provided

  const jsonData = {
    passcode: userInput,
  };

  try {
    const response = await superagent
      .post('/api/check_auth') // Use the /api prefix for the proxy
      .send(jsonData) // Send the JSON payload
      .set('X-Forwarded-For', userIp) 
      .set('Accept', 'application/json'); // Set headers if needed

    const data = response.body; // Access the parsed JSON response

    if (data.isAuthorized) {
      handleDelete(index); // Call the handleDelete function to delete the player
      console.log('Player deleted successfully for index:', index);
    } else {
      alert('Unauthorized access. Please try again.');
      console.log('Unauthorized access attempt with passcode:', userInput);
    }
  } catch (error) {
    console.error('Error deleting player:', error.message);
  }
};

   const handleExportClick = async () => {

   const userIp = await fetch('https://api.ipify.org?format=json')
  .then((res) => res.json())
  .then((data) => data.ip);


  const userInput = prompt("請輸入passcode");
  if (!userInput) return; // Exit if no input is provided

  const jsonData = {
    passcode: userInput,
  };

  try {
    const response = await superagent
      .post('/api/check_auth') // Use the /api prefix for the proxy
      .send(jsonData) // Send the JSON payload
      .set('X-Forwarded-For', userIp)
      .set('Accept', 'application/json'); // Set headers if needed

    const data = response.body; // Access the parsed JSON response

    if (data.isAuthorized) {
      await downloadFileWithGroup(); // Call the function to download the file
      console.log('Export successful');
    } else {
      alert('Unauthorized access. Please try again.');
      console.log('Unauthorized access attempt with passcode:', userInput);
    }
  } catch (error) {
    console.error('Error exporting data:', error.message);
  }
};

   const downloadFileWithGroup = async () => {
  const userInput = prompt("請輸入需要輸出的分組");
  if (!userInput) return;

  const jsonData = {
    groups: userInput,
  };

  try {
    const userIp = await fetch('https://api.ipify.org?format=json')
    .then((res) => res.json())
    .then((data) => data.ip);
    const response = await superagent
      .post('/api/export_whitelist') // Use the /api prefix for the proxy
      .send(jsonData) // Send the JSON payload
      .set('X-Forwarded-For', userIp)
      .responseType('blob'); // Set response type to blob for file download

    const blob = new Blob([response.body], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    alert('成功輸出');
    const a = document.createElement('a');
    a.href = url;
    a.download = `groups_${userInput}.json`; // or use backend-disposition name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert('Download failed: ' + error.message);
    console.error('Error downloading file:', error.message);
  }
};

    const handleDelete = async (index) => {
      const userIp = await fetch('https://api.ipify.org?format=json')
    .then((res) => res.json())
    .then((data) => data.ip);

      const jsonData = {
        key_index: index,
      };

      try {
        const response = await superagent
          .post('/api/drop_sign_up') // Use the /api prefix for the proxy
          .send(jsonData) // Send the JSON payload
          .set('X-Forwarded-For', userIp)
          .set('Accept', 'application/json'); // Set headers if needed

        //const data = response.body; // Access the parsed JSON response

        alert('成功删除報名記錄');
        setEditMode(null); // Exit edit mode
        setFormData({}); // Clear form data
        console.log(`Deleted sign-up record for player at index ${index}`);
      } catch (error) {
        console.error('Error deleting player:', error.message);
        console.log('Request payload:', JSON.stringify(jsonData));
      }
  };


const handleSave = async (index) => {
  const userIp = await fetch('https://api.ipify.org?format=json')
  .then((res) => res.json())
  .then((data) => data.ip);

  const updatedPlayer = { ...players[index], ...formData, index };
  console.log(`Saving changes for player at index ${index}:`, updatedPlayer);

  try {
    const response = await superagent
      .post('/api/edit_save') // Use the /api prefix for the proxy
      .send(updatedPlayer) // Send the updated player data as JSON
      .set('X-Forwarded-For', userIp)
      .set('Accept', 'application/json'); // Set headers if needed

    const data = response.body; // Access the parsed JSON response

    alert('成功修改');
    setPlayers(data.players); // Update the players state with the new data
    setEditMode(null); // Exit edit mode
    setFormData({}); // Clear form data
    console.log(`Saved changes for player at index ${index}`);
  } catch (error) {
    console.error('Error saving player:', error.message);
    console.log('Request payload:', JSON.stringify(updatedPlayer));
  }
};


  return (
    <div className="App">
      <header className="App-header">
        <h1>報名清單</h1>
        {players ? (
          isPermittedUser ? (
            <div>
              <p>管理員模式</p>
              <table style={{ borderCollapse: 'collapse', margin: 'auto'  }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>編號</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Discord頭像</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Discord名稱</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Minecraft頭像</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Minecraft名稱</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>玩家分組</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>編輯</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>刪除</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index+1}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <img
                          src={player.avatar_url}
                          alt={`${player.discord_username}'s Discord Avatar`}
                          style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                        />
                      </td>
                       {editmode === index ? (
                        <>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{player.discord_username}</td>
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                            <input
                              type="text"
                              defaultValue={player.minecraft_player}
                              onChange={(e) => handleEditChange(e, 'minecraft_player')}
                              style={{ width: '100%' }}
                            />
                          </td>
                         <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                         <img
                          src={`https://crafatar.com/avatars/${player.minecraft_player_uuid}?size=50&overlay`}
                          alt={`${player.minecraft_player}'s Minecraft Avatar`}
                          style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                         />
                        </td>
                           <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                            <input
                              type="text"
                              defaultValue={player.groups}
                              onChange={(e) => handleEditChange(e, 'groups')}
                              style={{ width: '100%' }}
                            />
                          </td>
                              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button
                                  onClick={() => handleClick(index)}
                                  style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    backgroundColor: '#4CAF50', // Green background
                                    color: 'white', // White text
                                    border: 'none', // Remove border
                                    borderRadius: '5px', // Rounded corners
                                    cursor: 'pointer', // Pointer cursor
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Add shadow
                                  }}
                                >
                                  保存
                                </button>
                              </td>
                              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button
                                  onClick={() => handleDeleteClick(index)}
                                  style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    backgroundColor: '#f44336', // Red background
                                    color: 'white', // White text
                                    border: 'none', // Remove border
                                    borderRadius: '5px', // Rounded corners
                                    cursor: 'pointer', // Pointer cursor
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Add shadow
                                  }}
                                >
                                  刪除
                                </button>
                              </td>
                        </>
                      ) : (
                        <>
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
                          <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                            <button
                              onClick={() => setEditMode(index)}
                              style={{
                                  padding: '10px 20px',
                                  fontSize: '14px',
                                  backgroundColor: '#4CAF50', // Green background
                                  color: 'white', // White text
                                  border: 'none', // Remove border
                                  borderRadius: '5px', // Rounded corners
                                  cursor: 'pointer', // Pointer cursor
                                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Add shadow
                                }}
                            >
                              編輯
                            </button>
                          </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                            <button
                              // onClick={() => handleSave(index)} 
                              onClick={() => handleDeleteClick(index)}
                                  style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    backgroundColor: '#f44336', // Red background
                                    color: 'white', // White text
                                    border: 'none', // Remove border
                                    borderRadius: '5px', // Rounded corners
                                    cursor: 'pointer', // Pointer cursor
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Add shadow
                                  }}
                            >
                              刪除
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                // onClick={() => handleSave(index)} 
                onClick={() => handleExportClick()}
                    style={{
                      padding: '10px 20px',
                      fontSize: '14px',
                      backgroundColor: 'orange', // Red background
                      color: 'white', // White text
                      border: 'none', // Remove border
                      borderRadius: '5px', // Rounded corners
                      cursor: 'pointer', // Pointer cursor
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Add shadow
                    }}
              >
                輸出白名單
              </button>
            </div>
          ) : (
            <div>
              <p>以下數據非真實數據</p>
              <table style={{ borderCollapse: 'collapse', margin: 'auto' }}>
                <thead>
                  <tr>
                   <th style={{ border: '1px solid #ddd', padding: '8px' }}>編號</th>
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
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index+1}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <p>Loading players...</p>
        )}
      </header>
    </div>
  );
}


export default App;