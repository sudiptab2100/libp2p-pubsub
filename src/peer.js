import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { noise } from "@chainsafe/libp2p-noise";
import { multiaddr } from "@multiformats/multiaddr";


const getNode = async () => {
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
        streamMuxer: [mplex]
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