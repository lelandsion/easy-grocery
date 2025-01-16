import React, { useEffect, useState } from 'react';

const AccountPage = ({ user }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) setLoading(false);
    }, [user]);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Account Page</h2>
            {user ? (
                <div>
                    <h3>Welcome, {user.username}</h3>
                    <p>Email: {user.email}</p>

                    <h4>Favorites</h4>
                    {user.favorites && user.favorites.length > 0 ? (
                        user.favorites.map(fav => (
                            <div key={fav._id}>
                                <p>{fav.name}</p>
                            </div>
                        ))
                    ) : (
                        <p>You don't have any favorites yet.</p>
                    )}

                    <h4>Shopping Lists</h4>
                    {user.shoppingLists && user.shoppingLists.length > 0 ? (
                        user.shoppingLists.map(list => (
                            <div key={list._id}>
                                <h5>{list.name}</h5>
                                <ul>
                                    {list.items && list.items.length > 0 ? (
                                        list.items.map(item => (
                                            <li key={item._id}>{item.name}</li>
                                        ))
                                    ) : (
                                        <li>No items in this list.</li>
                                    )}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <p>You don't have any shopping lists yet.</p>
                    )}
                </div>
            ) : (
                <p>Please log in to view your account.</p>
            )}
        </div>
    );
};

export default AccountPage;