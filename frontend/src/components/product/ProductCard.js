import React, { useState, useEffect } from 'react';
import axios from "../../api";
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';



/* ================= STORE MAP (TEMP FIX) ================= */

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

/* ================= STYLES ================= */

const Card = styled.div`
    position: relative;
    background: white;
    border-radius: 12px;
    padding: 12px;
    border: 1px solid #eee;
    cursor: pointer;

    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: visible;
`;

const ImageWrapper = styled.div`
    position: relative;
    z-index: 0;
`;

const RemoveButton = styled.button`
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 50;

    width: 24px;
    height: 24px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(6px);

    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 999px;

    color: #555;
    font-size: 12px;
    cursor: pointer;

    pointer-events: auto;
    &:active {

        transform: scale(0.9);

        background: rgba(0, 0, 0, 0.15);

    }
    
`;

const Image = styled.img`
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 8px;
`;

const Title = styled.div`
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 4px;
`;

/* ================= STORE BADGE ================= */

const StoreBadge = styled(Link)`
    position: absolute;
    top: 8px;
    left: 8px;

    display: inline-flex;
    align-items: center;
    gap: 6px;

    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(6px);

    border-radius: 999px;
    border: 1px solid rgba(0,0,0,0.06);

    text-decoration: none;
    color: #111;

    transition: all 0.15s ease;

    &:hover {
        transform: translateY(-1px);
        background: rgba(255, 255, 255, 0.95);
    }
`;

const StoreLogo = styled.img`
    width: 16px;
    height: 16px;
    object-fit: cover;
    border-radius: 50%;
`;

const StoreName = styled.span`
    font-size: 11px;
    color: #555;
`;

/* ================= BUTTON ================= */

const AddButton = styled.button`
    margin-top: auto;
    width: 100%;
    padding: 6px;
    border-radius: 8px;
    border: none;
    background: #22c55e;
    color: white;
    cursor: pointer;

    &:hover {
        background: #16a34a;
    }
`;

const Price = styled.div`
    font-size: 15px;
    font-weight: 700;
    margin-top: 4px;
    margin-bottom: 10px;
    color: #111;
`;

/* ================= DROPDOWN ================= */

const Dropdown = styled.div`
    position: absolute;
    background: white;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 10px;
    margin-top: 8px;
    width: 180px;
    z-index: 10;
`;

const ListItem = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    cursor: pointer;
`;

const Checkbox = styled.div`
    width: 14px;
    height: 14px;
    border-radius: 4px;
    border: 1px solid #aaa;
    background: ${props => (props.$checked ? '#22c55e' : 'white')};
`;

const SmallButton = styled.button`
    margin-top: 6px;
    font-size: 12px;
    background: none;
    border: none;
    color: #22c55e;
    cursor: pointer;
`;

/* ================= COMPONENT ================= */

const Content = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const Spacer = styled.div`
    flex: 1;
`;

const ProductCard = ({ product, onRemove }) => {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [lists, setLists] = useState([]);
    const [selected, setSelected] = useState([]);
    const [creating, setCreating] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');

    /* ================= STORE RESOLUTION (FIX) ================= */

    const store =
        typeof product.store === "object"
            ? product.store
            : STORE_MAP[product.store];

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

    /* ================= CLOSE ON OUTSIDE CLICK ================= */

    useEffect(() => {
        const handleClick = () => setOpen(false);
        if (open) document.addEventListener("click", handleClick);

        return () => document.removeEventListener("click", handleClick);
    }, [open]);

    /* ================= TOGGLE ================= */

    const toggleList = (listId) => {
        setSelected(prev =>
            prev.includes(listId)
                ? prev.filter(id => id !== listId)
                : [...prev, listId]
        );
    };

    /* ================= ADD ================= */

    const addToLists = async () => {
        if (!token || !product?._id || selected.length === 0) return;

        try {
            setLoading(true);

            await Promise.all(
                selected.map(listId => {
                    if (!listId) return null;
                    return axios.post(
                        `/api/user/lists/${listId}/items`,
                        { productId: product._id },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                })
            );

            await fetchLists();

            setSelected([]);
            setOpen(false);

            // ✅ ADD THIS
            toast.success(`${product.name} added to ${selected.length} list${selected.length > 1 ? 's' : ''}`);

        } catch (err) {
            console.error("ADD FAILED:", err.response?.data || err.message);

            // ✅ Optional but very useful
            toast.error("Failed to add item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            {onRemove && (
                <RemoveButton
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log("REMOVING PRODUCT ID:", product._id);
                        onRemove(product.listItemId);
                    }}
                >
                    ✕
                </RemoveButton>
            )}

            {product.isDeal && (

                <div style={{

                    position: 'absolute',

                    top: 8,

                    right: 8,

                    background: '#ef4444',

                    color: 'white',

                    padding: '4px 8px',

                    borderRadius: '6px',

                    fontSize: '11px',

                    fontWeight: 600

                }}>

                    🔥 {Math.round(product.score * 100)}% OFF

                </div>

            )}

            <ImageWrapper>

                {/* STORE BADGE */}
                {store && (
                    <StoreBadge to={`/stores/${product.store}`}>
                        <StoreLogo src={store.logo} alt={store.name} />
                        <StoreName>{store.name}</StoreName>
                    </StoreBadge>
                )}

                <Image
                    src={product.image_url}
                    alt={product.name}
                    onClick={() => navigate(`/products/${product._id}`)}
                />

                <p style={{ fontSize: '12px', color: '#777' }}>
                    Sold by {store?.name || "Unknown Store"}
                </p>

            </ImageWrapper>
            <Content>
                <Title onClick={() => navigate(`/products/${product._id}`)}>
                    {product.name}
                </Title>
                <Spacer />
                <Price>${Number(product.price).toFixed(2)}</Price>
            </Content>

            <AddButton
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(true);
                }}
            >
                Add to List
            </AddButton>

            {open && (
                <Dropdown onClick={(e) => e.stopPropagation()}>

                    {lists.length === 0 && (
                        <p style={{ fontSize: 12, color: '#888' }}>
                            No lists found
                        </p>
                    )}

                    {lists.map(list => (
                        <ListItem
                            key={list._id}
                            onClick={() => toggleList(list._id)}
                        >
                            {list.name}
                            <Checkbox $checked={selected.includes(list._id)} />
                        </ListItem>
                    ))}

                    {creating ? (
                        <>
                            <input
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                placeholder="List name"
                                style={{
                                    width: '100%',
                                    padding: '6px',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd',
                                    marginTop: '8px'
                                }}
                            />

                            <AddButton
                                onClick={async () => {
                                    if (!newListName.trim()) return;

                                    await axios.post(
                                        '/api/user/lists',
                                        { name: newListName, items: [] },
                                        { headers: { Authorization: `Bearer ${token}` } }
                                    );

                                    setNewListName('');
                                    setCreating(false);
                                    fetchLists();
                                }}
                            >
                                Create
                            </AddButton>

                            <SmallButton onClick={() => setCreating(false)}>
                                Cancel
                            </SmallButton>
                        </>
                    ) : (
                        <SmallButton onClick={() => setCreating(true)}>
                            + New List
                        </SmallButton>
                    )}

                    <AddButton
                        onClick={addToLists}
                        disabled={selected.length === 0 || loading}
                    >
                        {loading ? "Adding..." : "Add Selected"}
                    </AddButton>

                </Dropdown>
            )}

        </Card>
    );
};

export default ProductCard;