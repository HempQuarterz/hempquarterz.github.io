import React from 'react';

const BibleItem = ({ bible }) => {
  // Destructure the properties from the 'bible' prop
  const { name, abbreviation, language, countries} = bible;

  // Render the Bible details
  return (
    <div>
      <h2>{name}</h2>
      <p>Abbreviation: {abbreviation}</p>
      <p>Language: {language.name}</p>
      <p>Countries: {countries.map((country) => country.name).join(', ')}</p>
      {/* other Bible details */}
    </div>
  );
};

export default BibleItem;
