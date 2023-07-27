import React, { useEffect, useState } from 'react'
import BibleDetails from '../components/BibleDetails';
import BibleDataHandler from '../components/BibleDataHandler'
import BibleItem from '../components/BibleItem';
import axios from 'axios';
import styles from '../index.css';


const HomePage = () => {
    const [bibles, setBibles] = useState([]);
    const [selectedBible, setSelectedBible] = useState(null);

    useEffect(() => {
        const fetchBibles = async () => {
            try {
                const apiKey = '5875acef5839ebced9e807466f8ee3ce';

                const response = await axios.get('https://api.scripture.api.bible/v1/bibles', {
                headers: {
                    'api-key': '5875acef5839ebced9e807466f8ee3ce',
                },
            });
                const sortedBibles = response.data.data.sort((a, b) =>
                a.name.localeCompare(b.name)
                );
        setBibles(sortedBibles);
        } catch (error) {
            console.error('Error fetching Bibles', error);
    }
};

    fetchBibles();
    }, []);

    const handleBibleClick = (bible) => {
        setSelectedBible(bible);
    };

  return (
    <div>
        <h1>List of Bibles</h1>
        <div className="bible-grid">
        {bibles.map((bible) => (
            <div
              key={bible.id}
              className="bible-item"
              onClick={() => handleBibleClick(bible)}
              >
            <BibleItem bible={bible} />
            </div>
        ))}
    </div>
    {selectedBible && <BibleDetails bible={selectedBible} />}
    </div>
  );
};

export default HomePage