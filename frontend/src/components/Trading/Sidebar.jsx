import React from 'react';
import { LineChart, Minus, RectangleHorizontal, Text, Eraser, Move, Smile, Brush, Settings, Search } from 'lucide-react';

const Sidebar = () => {
  const tools = [
    { name: 'Trend Line', icon: <LineChart size={20} />, onClick: () => console.log('Trend Line') },
    { name: 'Horizontal Line', icon: <Minus size={20} />, onClick: () => console.log('Horizontal Line') },
    //{ name: 'Rectangle', icon: <RectangleHorizontal size={20} />, onClick: () => console.log('Rectangle') },
    { name: 'Zoom In', icon: <Search size={20} />, onClick: () => console.log('Magnifier Tool') },
    { name: 'Brush', icon: <Brush size={20} />, onClick: () => console.log('Brush') },
    { name: 'Text', icon: <Text size={20} />, onClick: () => console.log('Text Tool') },
    { name: 'Eraser', icon: <Eraser size={20} />, onClick: () => console.log('Eraser') },
    { name: 'Move', icon: <Move size={20} />, onClick: () => console.log('Move Tool') },
    { name: 'Emoji', icon: <Smile size={20} />, onClick: () => console.log('Emoji Tool') },
    { name: 'Settings', icon: <Settings size={20} />, onClick: () => console.log('Settings') },
  ];

  return (
    <div style={{
        width: '60px',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '10px',
        borderRight: '1px solid #333'
    }}>
      {tools.map((tool, index) => (
        <button
          key={index}
          onClick={tool.onClick}
          title={tool.name}
          style={{
            background: 'transparent',
            color: '#000',
            border: 'none',
            padding: '10px',
            cursor: 'pointer',
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '4px',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#999'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;

