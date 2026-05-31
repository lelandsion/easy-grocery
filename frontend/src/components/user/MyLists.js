import React, { useEffect, useState } from 'react';
import axios from "../../api";
import ListPreview from '../user/ListPreview';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ProductCard from '../product/ProductCard';
import toast from 'react-hot-toast';
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
    top: 18px;
    right: 18px;

    width: 28px;
    height: 28px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 1px solid #eee;
    border-radius: 999px;

    background: white;
    color: #999;

    font-size: 16px;
    cursor: pointer;

    transition: all 0.15s ease;

    &:hover {
        background: #fee2e2;
        color: #dc2626;
        border-color: #fecaca;
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
    padding: 20px;
    border-radius: 18px;
    border: 1px solid #e5e7eb;
    position: relative;
    box-shadow: 0 10px 28px rgba(0,0,0,0.04);
    transition: transform 0.15s ease, box-shadow 0.15s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 36px rgba(0,0,0,0.07);
    }
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

const RemoveItemButton = styled.button`
    width: 26px;
    height: 26px;
    min-width: 26px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 999px;
    border: 1px solid #e5e7eb;
    background: white;
    color: #9ca3af;

    font-size: 16px;
    line-height: 1;
    cursor: pointer;

    &:hover {
        background: #fee2e2;
        color: #dc2626;
        border-color: #fecaca;
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

const RecommendedCard = styled.div`
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 16px;
    padding: 18px;
    margin-bottom: 18px;
`;

const RecommendedTitle = styled.h3`
    margin: 0 0 6px 0;
`;

const RecommendedText = styled.p`
    color: #555;
    font-size: 14px;
    margin-bottom: 12px;
`;

const ToggleRow = styled.div`
    display: flex;
    gap: 8px;
    margin: 14px 0;
    flex-wrap: wrap;
`;

const ToggleButton = styled.button`
    padding: 7px 12px;
    border-radius: 999px;
    border: ${props => props.$active ? '1px solid #22c55e' : '1px solid #e5e7eb'};
    background: ${props => props.$active ? '#ecfdf5' : 'white'};
    color: ${props => props.$active ? '#15803d' : '#374151'};
    font-weight: 600;
    cursor: pointer;
`;

const StoreOptionButton = styled.button`
    padding: 7px 12px;
    border-radius: 999px;
    border: ${props => props.$active ? '1px solid #22c55e' : '1px solid #e5e7eb'};
    background: ${props => props.$active ? '#ecfdf5' : '#f9fafb'};
    color: ${props => props.$active ? '#15803d' : '#374151'};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
`;

const SavingsBox = styled.div`
    background: #f9fafb;
    border: 1px solid #eee;
    border-radius: 14px;
    padding: 14px;
    margin-top: 12px;
`;

const ProductGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
    margin-top: 12px;
`;


const ListHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    padding-right: 38px;
    margin-bottom: 14px;
`;

const ListTitleBlock = styled.div`
    min-width: 0;
`;

const ListTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
`;

const ListMeta = styled.div`
    margin-top: 4px;
    font-size: 13px;
    color: #6b7280;
`;

const IconButton = styled.button`
    position: absolute;
    top: 18px;
    right: 18px;

    width: 32px;
    height: 32px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 1px solid #e5e7eb;
    border-radius: 999px;

    background: #fff;
    color: #9ca3af;

    font-size: 18px;
    line-height: 1;
    cursor: pointer;

    &:hover {
        background: #fee2e2;
        color: #dc2626;
        border-color: #fecaca;
    }
`;

const ActionRow = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 16px 0 12px;
`;

const PillButton = styled.button`
    padding: 8px 13px;
    border-radius: 999px;
    border: ${props => props.$active ? '1px solid #22c55e' : '1px solid #e5e7eb'};
    background: ${props => props.$active ? '#ecfdf5' : '#fff'};
    color: ${props => props.$active ? '#15803d' : '#374151'};
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;

    &:hover {
        border-color: #22c55e;
        background: #f0fdf4;
    }
`;

const StoreOptions = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
`;

const SavingsSummary = styled.div`
    background: linear-gradient(180deg, #f9fafb, #ffffff);
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 14px;
    margin-top: 14px;
`;

const SavingsLine = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 14px;
    margin-top: 6px;
`;

const SavingsExplanation = styled.div`
    margin-top: 10px;
    font-size: 12px;
    color: #6b7280;
    line-height: 1.4;
`;

const SavingsHighlight = styled.div`
    margin-top: 8px;
    color: #15803d;
    font-weight: 700;
`;

const EmptyListBox = styled.div`
    background: #f9fafb;
    border: 1px dashed #d1d5db;
    border-radius: 14px;
    padding: 24px 16px;
    text-align: center;
    margin: 14px 0;
    color: #6b7280;
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
    const [loadingBestMap, setLoadingBestMap] = useState({});
    const [loadingSplitMap, setLoadingSplitMap] = useState({});
    const [recommendedList, setRecommendedList] = useState(null);
    const [addingRecommended, setAddingRecommended] = useState(false);
    const [addedRecommendations, setAddedRecommendations] = useState({});


    const showClickableToast = (message, route = '/account') => {
        toast((t) => (
            <div
                onClick={() => {
                    toast.dismiss(t.id);
                    navigate(route);
                }}
                style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                }}
            >
                <strong>{message}</strong>
                <span style={{ fontSize: 13, color: '#16a34a' }}>
                Click to view your stats →
            </span>
            </div>
        ), {
            duration: 5000
        });
    };


    const handleRemove = async (listId, productId) => {
        const token = localStorage.getItem('token');
        console.log("DELETE URL →", `/api/user/lists/${listId}/items/${productId}`);
        console.log("listId →", listId);
        console.log("productId →", productId);
        try {
            console.log("Attempting to remove item calling delete route");
            await axios.delete(
                `/api/user/lists/${listId}/items/${productId}`,
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
            showClickableToast('List created! Click to view your stats.', '/account');

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

    const addRecommendedList = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            setAddingRecommended(true);

            await axios.post(
                '/api/user/lists/recommend',
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const refreshed = await axios.get('/api/user/lists', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setLists(refreshed.data);

            // Hide recommendation after adding
            setAddedRecommendations(prev => ({
                ...prev,
                [recommendedList?.name || 'recommended']: true
            }));

            setRecommendedList(null);
            showClickableToast('Recommended list added! Click to view your stats.', '/account');

        } catch (err) {
            console.error(err);
        } finally {
            setAddingRecommended(false);
        }
    };



    /* ================= FETCH LISTS ================= */

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !isAuthenticated) return;

        axios.get('/api/user/lists/recommend/preview', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setRecommendedList(res.data))
            .catch(console.error);

    }, [isAuthenticated]);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setIsAuthenticated(false);
            setLoading(false);
            setError(null);
            return;
        }

        setIsAuthenticated(true);
        setLoading(true);

        axios.get('/api/user/lists', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                if (res.data.length === 0) {
                    const createRes = await axios.post(
                        '/api/user/lists',
                        {
                            name: 'My Grocery List',
                            items: []
                        },
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );

                    const newList = createRes.data.lists[createRes.data.lists.length - 1];

                    setLists([newList]);
                    return;
                }

                setLists(res.data);
            })
            .catch(err => {
                console.error(err);

                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                    setError(null);
                } else {
                    setError('Failed to load shopping lists.');
                }
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        Object.keys(bestStoresMap).forEach(async (listId) => {
            const bestStores = bestStoresMap[listId];
            const split = splitMap[listId];

            if (!bestStores?.length) return;

            const storeTotals = bestStores
                .map(s => s.total)
                .filter(total => total > 0 && total < 500);

            if (!storeTotals.length) return;

            const averageTotal =
                storeTotals.reduce((a, b) => a + b, 0) / storeTotals.length;

            const selectedStore = bestStores[0];
            const optimizedTotal = split?.total || selectedStore?.total;

            if (!optimizedTotal) return;

            const savings = averageTotal - optimizedTotal;

            if (savings > 0) {
                await axios.post(
                    '/api/user/stats/savings',
                    { listId, savings },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
        });
    }, [bestStoresMap, splitMap]);

    /* ================= FETCH BEST STORE ================= */


    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token || lists.length === 0) return;

        const fetchBestStores = async () => {
            const results = {};

            for (const list of lists) {
                if (!list.items || list.items.length === 0) continue;

                setLoadingBestMap(prev => ({
                    ...prev,
                    [list._id]: true
                }));

                try {
                    const res = await axios.get(
                        `/api/user/lists/${list._id}/best-store`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    results[list._id] = res.data;

                } catch (err) {
                    console.error(err);
                } finally {
                    setLoadingBestMap(prev => ({
                        ...prev,
                        [list._id]: false
                    }));
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
                if (!list.items || list.items.length === 0) continue;

                setLoadingSplitMap(prev => ({
                    ...prev,
                    [list._id]: true
                }));

                try {
                    const res = await axios.get(
                        `/api/user/lists/${list._id}/split`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    results[list._id] = res.data;

                } catch (err) {
                    console.error(err);
                } finally {
                    setLoadingSplitMap(prev => ({
                        ...prev,
                        [list._id]: false
                    }));
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

            {recommendedList?.items?.length > 0 &&
                !addedRecommendations[recommendedList.name || 'recommended'] && (
                <RecommendedCard>
                    <RecommendedTitle>{recommendedList.name}</RecommendedTitle>

                    <RecommendedText>
                        Auto-generated starter list based on common weekly grocery staples.
                        Add it to compare prices across stores instantly.
                    </RecommendedText>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: 10,
                            marginTop: 14,
                            marginBottom: 14
                        }}
                    >
                        {recommendedList.items.slice(0, 6).map(product => (
                            <ProductCard
                                key={product._id}
                                product={product}
                            />
                        ))}
                    </div>


                    {recommendedList.items.length > 6 && (
                        <p style={{fontSize: 13, color: '#666'}}>
                            + {recommendedList.items.length - 6} more items
                        </p>
                    )}

                    <Button onClick={addRecommendedList} disabled={addingRecommended}>
                    {addingRecommended ? 'Adding...' : 'Add this list'}
                    </Button>
                </RecommendedCard>
            )}

            {lists.length === 0 ? (

                <Center>

                    <h3>No lists yet</h3>

                </Center>

            ) : (

                <ListGrid>

                    {lists.map(list => {

                        const bestStores = bestStoresMap[list._id];

                        const split = splitMap[list._id];

                        const loadingBest = loadingBestMap[list._id];

                        const loadingSplit = loadingSplitMap[list._id];

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

                        const storeTotals = bestStores?.map(s => s.total).filter(Boolean) || [];

                        const averageTotal =
                            storeTotals.length > 0
                                ? storeTotals.reduce((a, b) => a + b, 0) / storeTotals.length
                                : null;

                        const bestSingleStore =
                            bestStores?.length > 0
                                ? bestStores.reduce((best, store) =>
                                    store.total < best.total ? store : best
                                )
                                : null;

                        const optimizedTotal =
                            activeView === "split"
                                ? split?.total
                                : selectedStore?.total;

                        const savingsVsAverage =
                            averageTotal != null && optimizedTotal != null
                                ? averageTotal - optimizedTotal
                                : null;

                        const savingsVsBestSingle =
                            bestSingleStore && split?.total
                                ? bestSingleStore.total - split.total
                                : null;

                        return (

                            <Card key={list._id}>

                                <IconButton
                                    aria-label={`Delete ${list.name}`}
                                    onClick={() => setListToDelete(list)}
                                >
                                    ×
                                </IconButton>

                                {list.items.length === 0 ? (
                                    <EmptyListBox>
                                        <p>Add items to this list to compare prices across stores.</p>

                                        <Button onClick={() => navigate('/search')}>
                                            Add items to compare prices
                                        </Button>
                                    </EmptyListBox>
                                ) : (
                                    <ListPreview
                                        list={list}
                                        onRemoveItem={(productId) => handleRemove(list._id, productId)}
                                    />
                                )}

                                {/* TOGGLE */}

                                <div style={{display: 'flex', gap: 8, marginBottom: 10}}>

                                    <ActionRow>
                                        <PillButton
                                            $active={activeView === "best"}
                                            onClick={() =>
                                                setActiveViewMap(prev => ({
                                                    ...prev,
                                                    [list._id]: "best"
                                                }))
                                            }
                                        >
                                            🏪 Best Store
                                        </PillButton>

                                        <PillButton
                                            $active={activeView === "split"}
                                            onClick={() =>
                                                setActiveViewMap(prev => ({
                                                    ...prev,
                                                    [list._id]: "split"
                                                }))
                                            }
                                        >
                                            ✂️ Cheapest Split
                                        </PillButton>
                                    </ActionRow>

                                </div>

                                {activeView === "best" && loadingBest && (
                                    <LoadingBox>
                                        Finding best store...
                                    </LoadingBox>
                                )}

                                {/* BEST STORE */}

                                {optimizedTotal != null && averageTotal != null && (
                                    <SavingsSummary>
                                        <SectionTitle>Savings Summary</SectionTitle>

                                        <SavingsLine>
                                            <span>Current total</span>
                                            <strong>${optimizedTotal.toFixed(2)}</strong>
                                        </SavingsLine>

                                        <SavingsLine>
                                            <span>Typical cost across all stores</span>
                                            <strong>${averageTotal.toFixed(2)}</strong>
                                        </SavingsLine>

                                        {savingsVsAverage > 0 && (
                                            <SavingsHighlight>
                                                Saves ${savingsVsAverage.toFixed(2)} vs average store pricing
                                            </SavingsHighlight>
                                        )}

                                        {activeView === "split" && savingsVsBestSingle > 0 && (
                                            <SavingsHighlight>
                                                Saves ${savingsVsBestSingle.toFixed(2)} vs best single store
                                            </SavingsHighlight>
                                        )}
                                        <SavingsExplanation>

                                            {activeView === "best"

                                                ? "Showing the cheapest single-store option. Savings are compared against the average cost across all stores."

                                                : "Showing the cheapest combination of stores. Items may be purchased from multiple stores to maximize savings."}

                                        </SavingsExplanation>
                                    </SavingsSummary>
                                )}

                                {activeView === "best" && bestStores?.length > 0 && (

                                    <BestStoreBox>
                                        <SectionTitle>Store Options</SectionTitle>

                                        <StoreOptions>
                                            {bestStores.slice(0, 3).map((store, index) => (
                                                <PillButton
                                                    key={index}
                                                    $active={index === selectedIndex}
                                                    onClick={() =>
                                                        setSelectedStoreMap(prev => ({
                                                            ...prev,
                                                            [list._id]: store.store
                                                        }))
                                                    }
                                                >
                                                    {store.store} (${store.total.toFixed(2)})
                                                </PillButton>
                                            ))}
                                        </StoreOptions>

                                        {selectedStore?.products?.length > 0 && (
                                            <ProductGrid>
                                                {selectedStore.products.map((p, index) => (
                                                    <ProductCard
                                                        key={`${list._id}-best-${selectedStore.storeId || selectedStore.store}-${p._id}-${index}`}
                                                        product={p}
                                                        listId={list._id}
                                                        onRemove={(productId) => handleRemove(list._id, productId)}
                                                    />
                                                ))}
                                            </ProductGrid>
                                        )}
                                    </BestStoreBox>

                                )}


                                {activeView === "split" && loadingSplit && (
                                    <LoadingBox>
                                        Calculating cheapest split...
                                    </LoadingBox>
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