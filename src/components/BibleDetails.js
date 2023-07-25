import React from 'react';

const BibleDetails = ({ bible }) => {
  const { name, description, language } = bible;

  return (
    <div>
      <h2>{name}</h2>
      <p>Description: {description}</p>
      <p>Language: {language.name}</p>
      {/*other Bible details*/}
    </div>
  );
};

export default BibleDetails;
