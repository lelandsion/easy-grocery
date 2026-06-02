import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from "../../api";
import styled from 'styled-components';
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";

/* ================= LAYOUT ================= */

const Page = styled.div`
    display: flex;
    justify-content: center;
    padding: 40px 20px;
    min-height: 100vh;
    background:
            radial-gradient(circle at top left, rgba(34,197,94,0.16), transparent 32%),
            linear-gradient(135deg, #f9fafb, #eefdf3);
`;

const ButtonRow = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 20px;
`;

const FavoriteButton = styled.button`
    margin-top: 0;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid #fcd34d;
    background: ${props => props.$active ? '#fef3c7' : 'white'};
    color: ${props => props.$active ? '#92400e' : '#374151'};
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.15s ease;
    min-width: 130px;

    &:hover {
        background: #fef3c7;
        transform: translateY(-1px);
    }
`;

const AddButton = styled.button`
    margin-top: 0;
    padding: 10px 14px;
    border-radius: 10px;
    border: none;
    background: #22c55e;
    color: white;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.15s ease;
    min-width: 130px;

    &:hover {
        background: #16a34a;
        transform: translateY(-1px);
    }
`;



const Container = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    max-width: 1000px;
    width: 100%;

    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(12px);

    border-radius: 20px;
    padding: 28px;
    border: 1px solid rgba(255,255,255,0.8);
    box-shadow: 0 20px 50px rgba(0,0,0,0.08);

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const ShopLink = styled.a`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    margin-top: 12px;
    padding: 10px 14px;

    border-radius: 10px;
    background: #111827;
    color: white;
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;

    &:hover {
        background: #030712;
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
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);
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

    const toggleFavorite = async () => {
        if (!token) {
            toast.error("Sign in to save favorites");
            navigate("/account");
            return;
        }

        try {
            if (isFavorite) {
                await axios.delete(`/api/user/favorites/${product._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setIsFavorite(false);
                toast.success("Removed from favorites");
            } else {
                await axios.post(
                    '/api/user/favorites',
                    { productId: product._id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setIsFavorite(true);
                toast.success("Added to favorites");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update favorites");
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

    /* ================= ADD TO FAVORITES================= */

    useEffect(() => {
        if (!token || !product?._id) return;

        axios.get('/api/user/favorites', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setIsFavorite(res.data.some(fav => fav._id === product._id));
            })
            .catch(console.error);
    }, [token, product?._id]);

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
                        <Section>
                            <p>
                                {product.description ||
                                    "Product details may vary. Please refer to the physical product or retailer listing for the most current information."}
                            </p>

                            {product.product_url && (
                                <ShopLink
                                    href={product.product_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View on {store?.name || "retailer"} →
                                </ShopLink>
                            )}
                        </Section>
                    </Section>

                    {/* ADD TO LIST BUTTON */}
                    <ButtonRow>
                        <AddButton
                            onClick={() => {
                                if (!token) {
                                    toast.error("Sign in to save this item to a grocery list");
                                    navigate("/account");
                                    return;
                                }

                                setOpen(!open);
                            }}
                        >
                            {token ? "Add to List" : "Sign in to Save"}
                        </AddButton>

                        <FavoriteButton
                            $active={isFavorite}
                            onClick={toggleFavorite}
                        >
                            {isFavorite ? "★ Saved" : "☆ Favorite"}
                        </FavoriteButton>
                    </ButtonRow>
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