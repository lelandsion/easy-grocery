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

const ListPreview = ({ list, onRemoveItem }) => {
    return (
        <ListContainer>
            <ListTitle>{list.name}</ListTitle>
            <ListItems>
                {list.items.map(item => (
                    <div
                        key={item._id}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                            padding: "6px 0"
                        }}
                    >
                        <span>{item.name}</span>

                        <button
                            onClick={() => onRemoveItem(item._id)}
                            style={{
                                border: "none",
                                background: "#f3f4f6",
                                borderRadius: "999px",
                                width: "24px",
                                height: "24px",
                                cursor: "pointer"
                            }}
                        >
                            -
                        </button>
                    </div>
                ))}
            </ListItems>
        </ListContainer>
    );
};

export default ListPreview;