import React from 'react';
import { useParams } from 'react-router-dom';

const BibleDetailsPage = ({ bible }) => {
  const { id } = useParams();



  const { name, description, language } = bible;

  return (
    <div>
      <h1>Bible Details</h1>
      <h2>{name}</h2>
      <p>Description: {description}</p>
      <p>Language: {language}</p>
      {/*other Bible details*/}
    </div>
  );
};

export default BibleDetailsPage;
