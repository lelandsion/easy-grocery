import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from "../../api";
import styled from 'styled-components';

/* ================= LAYOUT ================= */

const Page = styled.div`
    display: flex;
    justify-content: center;
    padding: 40px 20px;
    background: #f9fafb;
    min-height: 100vh;
`;

const Container = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    max-width: 1000px;
    width: 100%;
    background: white;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid #eee;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const Image = styled.img`
    width: 100%;
    border-radius: 12px;
`;

const Title = styled.h1`
    margin: 0;
`;

const Price = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: #16a34a;
    margin-top: 10px;
`;

const Store = styled.div`
    margin-top: 10px;
    display: inline-block;
    padding: 6px 10px;
    background: #f3f4f6;
    border-radius: 8px;
    font-size: 13px;
`;

const Section = styled.div`
    margin-top: 20px;
`;

/* ================= BUTTON ================= */

const AddButton = styled.button`
    margin-top: 20px;
    padding: 10px 14px;
    border-radius: 10px;
    border: none;
    background: #22c55e;
    color: white;
    cursor: pointer;
`;

/* ================= DROPDOWN ================= */

const Dropdown = styled.div`
    margin-top: 10px;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 10px;
    background: white;
`;

const ListItem = styled.div`
    padding: 8px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;

    &:hover {
        background: #f3f4f6;
    }
`;

const Checkbox = styled.div`
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background: ${props => (props.$checked ? '#22c55e' : 'white')};
`;

const SmallButton = styled.button`
    width: 100%;
    margin-top: 8px;
    padding: 8px;
    border-radius: 8px;
    border: 1px dashed #ccc;
    background: transparent;
    cursor: pointer;
`;

/* ================= COMPONENT ================= */

const ProductDetailsPage = () => {
    const { id } = useParams();

    const [product, setProduct] = useState(null);

    /* LIST STATE (same logic as ProductCard) */
    const [open, setOpen] = useState(false);
    const [lists, setLists] = useState([]);
    const [selected, setSelected] = useState([]);
    const [creating, setCreating] = useState(false);
    const [newListName, setNewListName] = useState('');

    const token = localStorage.getItem('token');

    const STORE_MAP = {

        "6732efc8132efbd2898fdc6d": {

            name: "Costco",

            logo: "/costco-logo.png"

        },

        "6732efc8132efbd2898fdc70": {

            name: "IGA",

            logo: "/iga-logo.png"

        },

        "6732efc8132efbd2898fdc6f": {

            name: "Loblaws",

            logo: "/loblaws-logo.png"

        },

        "6732efc8132efbd2898fdc6c": {

            name: "Walmart",

            logo: "/walmart-logo.svg"

        },

        "6732efc8132efbd2898fdc6e": {

            name: "Whole Foods",

            logo: "/whole-foods-market-logo.png"

        }

    };



    /* ================= FETCH PRODUCT ================= */

    useEffect(() => {
        axios.get(`/api/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(err => console.error(err));
    }, [id]);


    /* ================= FETCH LISTS ================= */

    const fetchLists = async () => {
        if (!token) return;

        try {
            const res = await axios.get('/api/user/lists', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLists(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLists();
    }, []);

    /* ================= TOGGLE ================= */

    const toggleList = (listId) => {
        setSelected(prev =>
            prev.includes(listId)
                ? prev.filter(id => id !== listId)
                : [...prev, listId]
        );
    };

    /* ================= ADD TO LIST ================= */

    const addToLists = async () => {
        if (!token || !product?._id || selected.length === 0) return;

        try {
            await Promise.all(
                selected.map(listId =>
                    axios.post(
                        `/api/user/lists/${listId}/items`,
                        { productId: product._id },
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                )
            );

            setSelected([]);
            setOpen(false);
        } catch (err) {
            console.error(err);
        }
    };

    if (!product) return <p>Loading...</p>;

    const store =

        typeof product.store === "object"

            ? product.store

            : STORE_MAP[product.store];


    if (!product) return <p>Loading...</p>;

    return (
        <Page>
            <Container>

                {/* IMAGE */}
                <div>
                    <Image src={product.image_url} alt={product.name} />
                </div>

                {/* DETAILS */}
                <div>
                    <Title>{product.name}</Title>

                    <Price>${product.price}</Price>

                    <Store>

                        {store?.logo && (
                            <img
                                src={store.logo}
                                alt={store.name}
                                style={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: "50%",
                                    marginRight: 6,
                                    verticalAlign: "middle"
                                }}
                            />
                        )}
                        {store?.name || "Unknown Store"}
                    </Store>

                    <Section>
                        <p>{product.description || "No description available."}</p>
                    </Section>

                    {/* ADD TO LIST BUTTON */}
                    <AddButton onClick={() => setOpen(!open)}>
                        Add to List
                    </AddButton>

                    {/* DROPDOWN */}
                    {open && (
                        <Dropdown>

                            {lists.map(list => (
                                <ListItem
                                    key={list._id}
                                    onClick={() => toggleList(list._id)}
                                >
                                    {list.name}
                                    <Checkbox $checked={selected.includes(list._id)} />
                                </ListItem>
                            ))}

                            <SmallButton
                                onClick={async () => {
                                    if (!newListName.trim()) return;

                                    await axios.post(
                                        '/api/user/lists',
                                        { name: newListName, items: [] },
                                        { headers: { Authorization: `Bearer ${token}` } }
                                    );

                                    setNewListName('');
                                    fetchLists();
                                }}
                            >
                                + Create New List
                            </SmallButton>

                            <AddButton onClick={addToLists}>
                                Add Selected
                            </AddButton>

                        </Dropdown>
                    )}

                </div>

            </Container>
        </Page>
    );
};

export default ProductDetailsPage;