import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';

const RabbitMQStompClient = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:15674/ws',
      connectHeaders: {
        login: 'guest',
        passcode: 'guest',
      },
      debug: function (str) {
        console.log(str);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to RabbitMQ STOMP');

        client.subscribe('/queue/presignedbucket_queue', (message) => {
          if (message.body) {
            const data = JSON.parse(message.body);
            setMessages((prev) => [data, ...prev]);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  // Extract table headers dynamically from first message keys (if any messages exist)
  const headers = messages.length > 0 ? Object.keys(messages[0]) : [];

  return (
    <div>
      <h3>Real-time Records</h3>
      {messages.length === 0 ? (
        <p>No messages received yet.</p>
      ) : (
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            marginTop: '10px',
          }}
        >
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  style={{
                    border: '1px solid #ddd',
                    padding: '8px',
                    backgroundColor: '#f2f2f2',
                    textAlign: 'left',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {messages.map((msg, idx) => (
              <tr key={idx}>
                {headers.map((header) => (
                  <td
                    key={header}
                    style={{
                      border: '1px solid #ddd',
                      padding: '8px',
                    }}
                  >
                    {typeof msg[header] === 'object'
                      ? JSON.stringify(msg[header])
                      : String(msg[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RabbitMQStompClient;