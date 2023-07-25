import React from 'react';

const BibleItem = ({ bible }) => {
  // Destructure the properties from the 'bible' prop
  const { name, abbreviation, language, countries, description, audioBibles } = bible;

  // Render the Bible details
  return (
    <div>
      <h2>{name}</h2>
      <p>Abbreviation: {abbreviation}</p>
      <p>Language: {language.name}</p>
      <p>Countries: {countries.map((country) => country.name).join(', ')}</p>
      <p>Description: {description}</p>
      {/* Render other Bible details as needed */}
    </div>
  );
};

export default BibleItem;
