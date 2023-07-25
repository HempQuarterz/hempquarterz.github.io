import React, {useEffect, useState} from 'react'
import axios from 'axios';
import BibleList from './BibleList';

const BibleDataHandler = () => {
    const [bibles, setBibles] = useState([]);
    const [loading, setLoading] = useState(true);
    

    useEffect(() => {
        const apiKey = '5875acef5839ebced9e807466f8ee3ce'

        axios.defaults.headers.common['api-key'] = apiKey;

        const fetchBibles = async () => {
            try{
                const response = await axios.get('https://api.scripture.api.bible/v1/bibles');
                setBibles(response.data.bibles);
                setLoading(false);
            }catch (error) {
                console.error('Error fetching Bibles', error);
                setLoading(false);
              }
            };

            fetchBibles ();
        }, []);




  return (
    <div>
        {loading ? (
            <p>Loading...</p>
            ) : (
            <div>
                <BibleList bibles={bibles} />
            </div>
            )}
            </div>
  );
};

export default BibleDataHandler;