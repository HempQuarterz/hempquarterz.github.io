import React, { useEffect, useState } from 'react'
import BibleList from '../components/BibleList'
import BibleDataHandler from '../components/BibleDataHandler'
import BibleItem from '../components/BibleItem';
import axios from 'axios';

const HomePage = () => {
    const [bibles, setBibles] = useState([]);

    useEffect(() => {
        const fetchBibles = async () => {
            try {
                const response = await axios.get('https://api.scripture.api.bible/v1/bibles');
        setBibles(response.data.data);
        } catch (error) {
            console.error('Error fetching Bibles', error);
    }
};

    fetchBibles();
    }, []);

  return (
    <div>
        <h1>List of Bibles</h1>
        {bibles.map((bible) => (
            <BibleItem key={bible.id} bible={bible} />
        ))}
    </div>
  );
};

export default HomePage