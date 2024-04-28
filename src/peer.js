import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { noise } from "@libp2p/noise";
import { multiaddr } from "@multiformats/multiaddr";
import { kadDHT, removePrivateAddressesMapper, removePublicAddressesMapper } from "@libp2p/kad-dht";
import { mdns } from "@libp2p/mdns";
import { bootstrap } from "@libp2p/bootstrap";
import { identify } from "@libp2p/identify";


const getNode = async () => {
    const bootstrapers = [
        '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
        '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
    ];
    
    const node = await createLibp2p({
        start: false,
        addresses: {
            listen: [
                '/ip4/0.0.0.0/tcp/0',
                '/ip4/0.0.0.0/tcp/0/wss',
                '/ip4/0.0.0.0/tcp/0/ws',
                '/'
            ]
        },
        transports: [
            tcp(),
            webSockets()
        ],
        connectionEncryption: [noise()],
        streamMuxer: [mplex],
        peerDiscovery: [
            bootstrap({
                list: bootstrapers,
                timeout: 1000, // in ms,
                tagName: 'bootstrap',
                tagValue: 50,
                tagTTL: 120000 // in ms
            })
        ],
        services: {
            dht: mdns(),
            aminoDHT: kadDHT({
                protocol: '/ipfs/kad/1.0.0',
                peerInfoMapper: removePrivateAddressesMapper
            }),
            lanDHT: kadDHT({
                protocol: '/ipfs/lan/kad/1.0.0',
                peerInfoMapper: removePublicAddressesMapper,
                clientMode: false
            }),
            identify: identify({
                runOnTransientConnection: true
            })
        }
    });
    
    node.addEventListener('peer:discovery', (evt) => {
        console.log('found peer: ', evt.detail.id)
    });
    
    node.addEventListener('self:peer:update', () => {
        var isFirst = true;
        node.getMultiaddrs().forEach((addr) => {
            if(isFirst) {
                isFirst = false;
                console.log("\nListening on multiaddrs:");
            }
            console.log(addr.toString());
        });
    });
    
    return node;
}

const main = async () => {
    const node = await getNode();
    await node.start();
}

main();