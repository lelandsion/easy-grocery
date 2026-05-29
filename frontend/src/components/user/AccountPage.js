import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from "../../api";
import toast from 'react-hot-toast';
/* ================= LAYOUT ================= */

const Container = styled.div`
    max-width: 1000px;
    margin: 0 auto;
    padding: 32px 20px;
`;

const Header = styled.div`
    margin-bottom: 24px;
`;

const Title = styled.h2`
    font-size: 28px;
    margin-bottom: 6px;
`;

const Subtitle = styled.p`
    color: #666;
    font-size: 14px;
`;

const LogoutButton = styled.button`
    margin-left: auto;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1px solid #eee;
    background: white;
    cursor: pointer;
    font-size: 14px;
    transition: 0.2s ease;
    &:hover {
        background: #f3f4f6;
    }
    
`;
/* ================= CARD ================= */

const Card = styled.div`
    background: white;
    border-radius: 16px;
    padding: 20px;
    border: 1px solid #eee;
    margin-bottom: 20px;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
`;

const StatCard = styled.div`
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 14px;
    padding: 16px;
`;

const StatValue = styled.div`
    font-size: 24px;
    font-weight: 700;
    color: #15803d;
`;

const StatLabel = styled.div`
    font-size: 13px;
    color: #555;
    margin-top: 4px;
`;


/* ================= USER INFO ================= */

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const Username = styled.h3`
    margin: 0;
`;

const Email = styled.p`
    margin: 0;
    color: #666;
    font-size: 14px;
`;

/* ================= SECTION ================= */

const SectionTitle = styled.h4`
    margin-bottom: 12px;
`;

/* ================= GRID ================= */

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
`;

/* ================= ITEM ================= */

const ItemCard = styled.div`
    background: #f9fafb;
    border-radius: 10px;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #eee;
`;

/* ================= LIST ================= */

const ListCard = styled.div`
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 12px;
`;

const ListName = styled.h5`
    margin: 0 0 8px 0;
`;

const ListItems = styled.ul`
    padding-left: 16px;
    margin: 0;
    font-size: 14px;
    color: #444;
`;

/* ================= EMPTY ================= */

const Empty = styled.p`
    color: #888;
    font-size: 14px;
`;

/* ================= LOADING ================= */

const Center = styled.div`
    text-align: center;
    padding: 60px;
    color: #666;
`;

/* ================= COMPONENT ================= */

const AccountPage = ({ user, setUser }) => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // ✅ move up
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        axios.get('/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setUser(res.data);
            })
            .catch(() => {
                localStorage.removeItem('token');
                setUser?.(null);
                navigate('/login');
            })
            .finally(() => setLoading(false));

    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        axios.get('/api/user/stats', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setStats(res.data);

            })
            .catch(console.error);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser?.(null);
        navigate('/login', { replace: true });
    };

    if (loading) {

        return <Center>Loading account...</Center>;

    }

/*    if (!user) {

        return <Center>Please log in to view your account.</Center>;

    }*/

    return (

        <Container>

            <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <div>
                    <Title>Account</Title>
                    <Subtitle>Manage your profile, favorites, and lists</Subtitle>
                </div>

                <LogoutButton onClick={handleLogout}>
                    Logout
                </LogoutButton>

            </Header>

            <Card>

                <UserInfo>

                    <Username>{user.username}</Username>

                    <Email>{user.email}</Email>

                </UserInfo>

            </Card>

            <Card>
                <SectionTitle>Savings Stats</SectionTitle>

                <StatsGrid>
                    <StatCard>
                        <StatValue>${Number(stats?.estimatedSavings || 0).toFixed(2)}</StatValue>
                        <StatLabel>Estimated total saved</StatLabel>
                    </StatCard>

                    <StatCard>
                        <StatValue>{stats?.listsCreated || 0}</StatValue>
                        <StatLabel>Lists created</StatLabel>
                    </StatCard>

                    <StatCard>
                        <StatValue>{stats?.itemsCompared || 0}</StatValue>
                        <StatLabel>Items compared</StatLabel>
                    </StatCard>
                </StatsGrid>
            </Card>

            <Card>

                <SectionTitle>Favorites</SectionTitle>

                {user.favorites?.length ? (

                    <Grid>

                        {user.favorites.map(fav => (

                            <ItemCard key={fav._id}>

                                {fav.name}

                            </ItemCard>

                        ))}

                    </Grid>

                ) : (

                    <Empty>No favorites yet</Empty>

                )}

            </Card>

            <Card>

                <SectionTitle>Shopping Lists</SectionTitle>

                {user.shoppingLists?.length ? (

                    user.shoppingLists.map(list => (

                        <ListCard key={list._id}>

                            <ListName>{list.name}</ListName>

                            {list.items?.length ? (

                                <ListItems>

                                    {list.items.map(item => (

                                        <li key={item._id}>{item.name}</li>

                                    ))}

                                </ListItems>

                            ) : (

                                <Empty>No items in this list</Empty>

                            )}

                        </ListCard>

                    ))

                ) : (

                    <Empty>No shopping lists yet</Empty>

                )}

            </Card>

        </Container>

    );

};

export default AccountPage;