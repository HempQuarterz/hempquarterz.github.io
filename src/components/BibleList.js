import React from 'react'

const BibleList = ({ bibles }) => {
    if (!bibles || bibles.length === 0) {
        return <p>No Bibles available.</p>
    }

  return (
    <div>
    <h1>Available Bibles</h1>
    <ul>
        {bibles.map((bible) => (
            <li key={bible.id}>
                <strong>{bible.name}</strong> - {bible.language}
            </li>
        ))}
    </ul>
</div>
  );
};

export default BibleList