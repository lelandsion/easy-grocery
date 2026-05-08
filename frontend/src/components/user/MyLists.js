import React, { useEffect, useState } from 'react';
import axios from "../../api";
import ListPreview from '../user/ListPreview';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ProductCard from '../product/ProductCard';
/* ================= STYLES ================= */

const Page = styled.div`
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 20px;
`;

const Header = styled.div`
    margin-bottom: 24px;
`;

const Title = styled.h1`
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 6px;
`;

const Subtitle = styled.p`
    color: #666;
    font-size: 14px;
`;

const Center = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 20px;
    text-align: center;
    color: #555;
`;

const Button = styled.button`
    margin-top: 16px;
    padding: 10px 16px;
    border-radius: 10px;
    border: none;
    background: #22c55e;
    color: white;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background: #16a34a;
    }
`;

const DeleteListButton = styled.button`
    position: absolute;
    top: 40px;
    right: 20px;

    width: 24px;
    height: 24px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: none;
    border-radius: 999px;

    background: #f5f5f5;
    color: #777;

    font-size: 16px;
    cursor: pointer;

    transition: all 0.15s ease;

    &:hover {
        background: #ebebeb;
        color: #333;
    }
`;

const ListGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const LoadingBox = styled.div`
    padding: 40px;
    text-align: center;
    color: #666;
`;

const ErrorBox = styled.div`
    padding: 16px;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 10px;
`;

const Card = styled.div`
    background: white;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #eee;
    position: relative
`;

const BestStoreBox = styled.div`
    margin-top: 10px;
    font-size: 14px;
`;

const Secondary = styled.div`
    font-size: 12px;
    color: #666;
`;

const SectionTitle = styled.div`
    font-weight: 700;
    margin-bottom: 6px;
`;

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);

    display: flex;
    align-items: center;
    justify-content: center;

    z-index: 1000;
`;

const Modal = styled.div`
    background: white;
    border-radius: 16px;
    padding: 24px;
    width: 320px;

    box-shadow: 0 10px 30px rgba(0,0,0,0.12);
`;

const ModalTitle = styled.h3`
    margin: 0 0 8px 0;
    font-size: 18px;
`;

const ModalText = styled.p`
    margin: 0 0 20px 0;
    color: #666;
    font-size: 14px;
`;

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 15px;
`;

const ModalButton = styled.button`
    margin-top: 16px;
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    cursor: pointer;

    background: ${props => props.$danger ? '#ef4444' : '#f3f4f6'};
    color: ${props => props.$danger ? 'white' : '#333'};

    &:hover {
        opacity: 0.92;
    }
`;


const TopBar = styled.div`

    display: flex;

    justify-content: space-between;

    align-items: center;

    margin-top: 20px;

`;

const NewListButton = styled.button`

    padding: 10px 16px;

    border-radius: 10px;

    border: none;

    background: #22c55e;

    color: white;

    font-weight: 600;

    cursor: pointer;

    &:hover {

        background: #16a34a;

    }

`;

const Input = styled.input`

    width: 100%;

    padding: 10px 12px;

    border-radius: 10px;

    border: 1px solid #ddd;

    margin-top: 12px;

    outline: none;

    &:focus {

        border-color: #22c55e;

    }

`;

/* ================= COMPONENT ================= */

const ListPage = () => {

    const [lists, setLists] = useState([]);
    const [bestStoresMap, setBestStoresMap] = useState({});
    const [splitMap, setSplitMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [selectedStoreMap, setSelectedStoreMap] = useState({});
    const [activeViewMap, setActiveViewMap] = useState({});
    const navigate = useNavigate();
    const [listToDelete, setListToDelete] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newListName, setNewListName] = useState('');

    const handleRemove = async (listId, productId) => {
        const token = localStorage.getItem('token');
        console.log("DELETE URL →", `/api/user/lists/${listId}/items/${productId}`);
        console.log("listId →", listId);
        console.log("productId →", productId);
        try {
            console.log("Attempting to remove item calling delete route");
            await axios.delete(

                `http://localhost:5001/api/user/lists/${listId}/items/${productId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const res = await axios.get('/api/user/lists', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLists(res.data);

        } catch (err) {
            console.error(err);
        }

    };

    const handleCreateList = async () => {

        if (!newListName.trim()) return;

        const token = localStorage.getItem('token');

        try {

            const res = await axios.post(
                '/api/user/lists',
                {
                    name: newListName,
                    items: []
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setLists(prev => [res.data.lists[res.data.lists.length - 1], ...prev]);

            setNewListName('');
            setShowCreateModal(false);

        } catch (err) {

            console.error(err);

        }

    };

    const handleDeleteList = async () => {

        if (!listToDelete) return;

        const token = localStorage.getItem('token');

        try {

            await axios.delete(
                `/api/user/lists/${listToDelete._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setLists(prev =>
                prev.filter(list => list._id !== listToDelete._id)
            );

            setListToDelete(null);

        } catch (err) {

            console.error(err);

        }

    };



    /* ================= FETCH LISTS ================= */

    useEffect(() => {

        const token = localStorage.getItem('token');

        if (!token) {
            setIsAuthenticated(false);
            return;
        }

        setIsAuthenticated(true);

        setLoading(true);

        axios.get('/api/user/lists', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => setLists(res.data))
            .catch(err => {
                console.error(err);
                setError('Failed to load shopping lists.');
            })
            .finally(() => setLoading(false));
    }, []);

    /* ================= FETCH BEST STORE ================= */

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || lists.length === 0) return;
        const fetchBestStores = async () => {
            const results = {};
            for (const list of lists) {
                try {
                    const res = await axios.get(
                        `/api/user/lists/${list._id}/best-store`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    results[list._id] = res.data;
                } catch (err) {
                    console.error(err);
                }
            }
            setBestStoresMap(results);
        };

        fetchBestStores();

    }, [lists]);


    /* ================= FETCH SPLIT ================= */

    useEffect(() => {

        const token = localStorage.getItem('token');

        if (!token || lists.length === 0) return;

        const fetchSplits = async () => {

            const results = {};

            for (const list of lists) {

                try {

                    const res = await axios.get(

                        `/api/user/lists/${list._id}/split`,

                        { headers: { Authorization: `Bearer ${token}` } }

                    );

                    results[list._id] = res.data;

                } catch (err) {

                    console.error(err);

                }

            }

            setSplitMap(results);

        };

        fetchSplits();

    }, [lists]);

    /* ================= AUTH ================= */

    if (!isAuthenticated) {

        return (

            <Center>

                <h2>Sign in required</h2>
                <p>Log in to save and view you're lists.</p>

                <Button onClick={() => navigate('/account')}>Sign in</Button>

            </Center>

        );

    }

    if (loading) return <LoadingBox>Loading...</LoadingBox>;

    if (error) return <ErrorBox>{error}</ErrorBox>;



    /* ================= UI ================= */

    return (

        <Page>

            {listToDelete && (
                <ModalOverlay onClick={() => setListToDelete(null)}>

                    <Modal onClick={(e) => e.stopPropagation()}>

                        <ModalTitle>
                            Delete list?
                        </ModalTitle>

                        <ModalText>
                            "{listToDelete.name}" will be permanently removed.
                        </ModalText>

                        <ModalActions>

                            <ModalButton
                                onClick={() => setListToDelete(null)}
                            >
                                Cancel
                            </ModalButton>

                            <ModalButton
                                $danger
                                onClick={handleDeleteList}
                            >
                                Delete
                            </ModalButton>

                        </ModalActions>

                    </Modal>

                </ModalOverlay>
            )}

            {showCreateModal && (

                <ModalOverlay onClick={() => setShowCreateModal(false)}>

                    <Modal onClick={(e) => e.stopPropagation()}>

                        <ModalTitle>
                            Create New List
                        </ModalTitle>

                        <ModalText>
                            Give your shopping list a name.
                        </ModalText>

                        <Input
                            placeholder="Weekly groceries..."
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                        />

                        <ModalActions>

                            <ModalButton
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </ModalButton>

                            <ModalButton
                                $danger
                                onClick={handleCreateList}
                            >
                                Create
                            </ModalButton>

                        </ModalActions>

                    </Modal>

                </ModalOverlay>

            )}

            <Header>

                <Title>My Shopping Lists</Title>

                <Subtitle>
                    Track, manage, and optimize your grocery shopping
                </Subtitle>

                <TopBar>

                    <div />

                    <NewListButton
                        onClick={() => setShowCreateModal(true)}
                    >
                        + New List
                    </NewListButton>

                </TopBar>

            </Header>

            {lists.length === 0 ? (

                <Center>

                    <h3>No lists yet</h3>

                </Center>

            ) : (

                <ListGrid>

                    {lists.map(list => {

                        const bestStores = bestStoresMap[list._id];

                        const split = splitMap[list._id];

                        const activeView =

                            activeViewMap[list._id] ?? "best";

                        const selectedStoreName =

                            selectedStoreMap[list._id] ??

                            bestStores?.[0]?.store;

                        const selectedStore =

                            bestStores?.find(s => s.store === selectedStoreName) ||

                            bestStores?.[0];

                        const selectedIndex =

                            bestStores?.findIndex(s => s.store === selectedStoreName);

                        return (

                            <Card key={list._id}>

                                <DeleteListButton
                                    onClick={() => setListToDelete(list)}
                                >
                                    −
                                </DeleteListButton>
                                <ListPreview list={list} />

                                {/* TOGGLE */}

                                <div style={{display: 'flex', gap: 8, marginBottom: 10}}>

                                    <button

                                        onClick={() =>

                                            setActiveViewMap(prev => ({

                                                ...prev,

                                                [list._id]: "best"

                                            }))

                                        }

                                        style={{

                                            padding: '6px 10px',

                                            borderRadius: 8,

                                            border: activeView === "best" ? '2px solid #22c55e' : '1px solid #ddd'

                                        }}

                                    >

                                        🏪 Best Store

                                    </button>

                                    <button

                                        onClick={() =>

                                            setActiveViewMap(prev => ({

                                                ...prev,

                                                [list._id]: "split"

                                            }))

                                        }

                                        style={{

                                            padding: '6px 10px',

                                            borderRadius: 8,

                                            border: activeView === "split" ? '2px solid #22c55e' : '1px solid #ddd'

                                        }}

                                    >

                                        Split

                                    </button>

                                </div>

                                {/* BEST STORE */}

                                {activeView === "best" && bestStores?.length > 0 && (
                                    <BestStoreBox>
                                        <SectionTitle>Store Options</SectionTitle>
                                        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                                            {bestStores.slice(0, 3).map((store, index) => (
                                                <button

                                                    key={index}

                                                    onClick={() =>

                                                        setSelectedStoreMap(prev => ({

                                                            ...prev,

                                                            [list._id]: store.store

                                                        }))

                                                    }

                                                    style={{

                                                        padding: '6px 10px',

                                                        borderRadius: 8,

                                                        border: index === selectedIndex

                                                            ? '2px solid #22c55e'

                                                            : '1px solid #ddd'

                                                    }}

                                                >

                                                    {store.store} (${store.total.toFixed(2)})

                                                </button>

                                            ))}

                                        </div>

                                        {selectedStore?.products?.length > 0 && (

                                            <div style={{

                                                display: 'grid',

                                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',

                                                gap: 10,

                                                marginTop: 10

                                            }}>

                                                {selectedStore.products.map(p => (

                                                    <ProductCard

                                                        key={p._id}

                                                        product={p}

                                                        listId={list._id}

                                                        onRemove={(listItemId) => handleRemove(list._id, listItemId)}

                                                    />

                                                ))}

                                            </div>

                                        )}

                                    </BestStoreBox>

                                )}

                                {/* SPLIT */}

                                {activeView === "split" && split && (

                                    <BestStoreBox>

                                        <SectionTitle>Cheapest Split</SectionTitle>

                                        <div style={{

                                            display: 'grid',

                                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',

                                            gap: 10,

                                            marginTop: 10

                                        }}>

                                            {split.products?.map(p => (

                                                <ProductCard

                                                    key={p._id}

                                                    product={p}

                                                    listId={list._id}

                                                    onRemove={(listItemId) => handleRemove(list._id, listItemId)}

                                                />

                                            ))}

                                        </div>

                                        <div>Total: ${split.total?.toFixed(2)}</div>

                                    </BestStoreBox>

                                )}

                            </Card>

                        );

                    })}

                </ListGrid>

            )}

        </Page>

    );

};

export default ListPage;