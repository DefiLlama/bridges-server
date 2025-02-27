import fetch from 'node-fetch';
import retry from 'async-retry';

export const getItsToken = (tokenId: string) =>
    retry(() =>
        fetch("https://api.axelarscan.io/api/getITSAssets", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => data.find((item: any) => item.id === tokenId))
    );
