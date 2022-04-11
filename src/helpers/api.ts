import axios, { AxiosInstance } from "axios";
import { providers } from "ethers";
import { IAssetData, IGasPrices, IParsedTx } from "./types";
import { getChainData } from "./utilities";

const api: AxiosInstance = axios.create({
  baseURL: "https://ethereum-api.xyz",
  timeout: 30000, // 30 secs
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export async function rpcGetAccountAssets(address: string, chainId: number): Promise<IAssetData[]> {
  const rpcUrl = getChainData(chainId).rpc_url;
  const provider = new providers.JsonRpcProvider(rpcUrl);
  
  return [
    {
      ...getChainData(chainId).native_currency,
      balance: await (await provider.getBalance(address)).toString(),
    }
  ];
}

export const rpcGetAccountNonce = async (address: string, chainId: number): Promise<string> => {
  const rpcUrl = getChainData(chainId).rpc_url;
  const provider = new providers.JsonRpcProvider(rpcUrl);

  return (await provider.getTransactionCount(address)).toString();
};

export const rpcGetGasPrices = async (chainId: number): Promise<IGasPrices> => {
  const rpcUrl = getChainData(chainId).rpc_url;
  const provider = new providers.JsonRpcProvider(rpcUrl);

  const gasPrice = await provider.getGasPrice();

  return {
    average: {
      time: 0,
      price: gasPrice.toNumber()
    },
    slow: {
      time: 0,
      price: gasPrice.toNumber()
    },
    fast: {
      time: 0,
      price: gasPrice.toNumber()
    },
    timestamp: 0
  }
};

export async function apiGetAccountAssets(address: string, chainId: number): Promise<IAssetData[]> {
  if (getChainData(chainId).use_rpc_calls) {
    return rpcGetAccountAssets(address, chainId);
  }

  const response = await api.get(`/account-assets?address=${address}&chainId=${chainId}`);
  const { result } = response.data;
  return result;
}

export async function apiGetAccountTransactions(
  address: string,
  chainId: number,
): Promise<IParsedTx[]> {
  const response = await api.get(`/account-transactions?address=${address}&chainId=${chainId}`);
  const { result } = response.data;
  return result;
}

export const apiGetAccountNonce = async (address: string, chainId: number): Promise<string> => {
  if (getChainData(chainId).use_rpc_calls) {
    return rpcGetAccountNonce(address, chainId);
  }

  const response = await api.get(`/account-nonce?address=${address}&chainId=${chainId}`);
  const { result } = response.data;
  return result;
};

export const apiGetGasPrices = async (chainId: number): Promise<IGasPrices> => {
  if (getChainData(chainId).use_rpc_calls) {
    return rpcGetGasPrices(chainId);
  }

  const response = await api.get(`/gas-prices`);
  const { result } = response.data;
  return result;
};
