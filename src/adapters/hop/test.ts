import { getProvider } from "@defillama/sdk/build/general";
import { ethers } from "ethers";

const test = async () => {
    const provider = getProvider("ethereum") as any
    const tx = await provider.getTransaction("0x87222de8370aa4d2eb670a7fc994810313193f9a79e761f70a36ba76b9a9ce86")
    console.log(tx)
    const iface = new ethers.utils.Interface(['function bondWithdrawal(address recipient, uint256 amount, bytes32 transferNonce, uint256 bonderFee)'])
    console.log(iface.decodeFunctionData('bondWithdrawal', tx.data))

}

test()