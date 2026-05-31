// src/components/user/ListPreview.js
import React from 'react';
import styled from 'styled-components';

const ListContainer = styled.div`
    margin: 18px 0;
`;

const ListHeader = styled.div`
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    padding: 18px;
    border-radius: 16px;
    margin-bottom: 14px;
`;

const ListTitle = styled.h2`
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    color: white;
`;

const ListMeta = styled.div`
    margin-top: 4px;
    font-size: 13px;
    opacity: 0.9;
`;

const PreviewGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
`;

const PreviewItem = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #f9fafb;
`;

const PreviewImage = styled.img`
    width: 52px;
    height: 52px;
    object-fit: cover;
    border-radius: 10px;
    background: white;
`;

const PreviewInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const PreviewName = styled.div`
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const PreviewPrice = styled.div`
    margin-top: 3px;
    font-size: 12px;
    color: #6b7280;
`;

const QuantityPill = styled.span`
    margin-left: 6px;
    font-size: 12px;
    font-weight: 800;
    color: #15803d;
`;

const RemoveItemButton = styled.button`
    width: 28px;
    height: 28px;
    min-width: 28px;

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

const ListPreview = ({ list, onRemoveItem }) => {
    const itemCount = list.items?.reduce(
        (sum, item) => sum + Number(item.quantity || 1),
        0
    ) || 0;

    return (
        <ListContainer>
            <ListHeader>
                <ListTitle>🛒 {list.name}</ListTitle>
                <ListMeta>
                    {itemCount} item{itemCount === 1 ? '' : 's'} in this list
                </ListMeta>
            </ListHeader>

            <PreviewGrid>
                {list.items?.map(item => (
                    <PreviewItem key={item._id}>
                        <PreviewImage src={item.image_url} alt={item.name} />

                        <PreviewInfo>
                            <PreviewName>{item.name}</PreviewName>
                            <PreviewPrice>
                                ${Number(item.price || 0).toFixed(2)}
                                {item.quantity > 1 && (
                                    <QuantityPill>× {item.quantity}</QuantityPill>
                                )}
                            </PreviewPrice>
                        </PreviewInfo>

                        <RemoveItemButton onClick={() => onRemoveItem(item._id)}>
                            ×
                        </RemoveItemButton>
                    </PreviewItem>
                ))}
            </PreviewGrid>
        </ListContainer>
    );
};

export default ListPreview;