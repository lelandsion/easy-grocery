// src/components/user/ListPreview.js
import React from 'react';
import styled from 'styled-components';

// Styled components
const ListContainer = styled.div`
    border: 1px solid #ddd;
    border-radius: 8px;
    margin: 1em 0;
    padding: 1em;
    background-color: #f9f9f9;
`;

const ListTitle = styled.h3`
    margin: 0;
`;

const ListItems = styled.ul`
    list-style-type: none;
    padding: 0;
`;

const ListItem = styled.li`
    padding: 0.5em 0;
    border-bottom: 1px solid #ddd;

    &:last-child {
        border-bottom: none;
    }
`;

const ListPreview = ({ list }) => {
    return (
        <ListContainer>
            <ListTitle>{list.name}</ListTitle>
            <ListItems>
                {list.items.map(item => (
                    <ListItem key={item._id}>{item.name}</ListItem>
                ))}
            </ListItems>
        </ListContainer>
    );
};

export default ListPreview;