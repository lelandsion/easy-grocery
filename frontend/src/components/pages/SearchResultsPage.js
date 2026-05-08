import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../product/ProductCard';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const SearchResultsPage = () => {
    const query = useQuery().get('q');
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (!query) return;

        axios.get(`/api/products/search?q=${query}`)
            .then(res => {

                console.log("SEARCH RESPONSE:", res.data);

                setResults(res.data);

            })
            .catch(err => console.error(err));
    }, [query]);



    return (

        <div style={{ padding: '24px' }}>

            <h2>Results for "{query}"</h2>

            <div style={{

                display: 'grid',

                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',

                gap: '16px',

                marginTop: '16px'

            }}>

                {results.map((item) => (

                    <ProductCard key={item._id} product={item} />

                ))}

            </div>

        </div>

    );
};

export default SearchResultsPage;