import { FC, useEffect, useState, useMemo, useCallback } from 'react';
import { TOKEN_LIST_URL, RouteInfo } from '@jup-ag/core';
import { useJupiter } from '@jup-ag/react-hook';
import { PublicKey, Connection } from '@solana/web3.js';
// import { TokenInstructions } from '@project-serum/serum';
import { result, runInContext, sortBy, values } from 'lodash';
import { getTokenAccountsByOwnerWithWrappedSol,
  nativeToUi,
  zeroKey,
} from '@blockworks-foundation/mango-client'
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { ChevronDownIcon, CurrencyDollarIcon, SwitchVerticalIcon, AdjustmentsIcon, ExternalLinkIcon, SwitchHorizontalIcon } from '@heroicons/react/outline';
import { GrRotateRight } from "react-icons/gr";
import { Button } from './Button';
import { route } from 'next/dist/server/router';
import { RouteList } from './RoutesList';
import { notify } from '../utils/notifications';
import SwapTokenSelect from './SwapTokenSelect';
import { SlippageSettingsModal } from './SlippageSettingsModal';
import Modal from './Modal';
import { connect } from 'tls';

export interface Token {
  chainId: number // 101,
  address: string // 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  symbol: string // 'USDC',
  name: string // 'Wrapped USDC',
  decimals: number // 6,
  logoURI: string // 'http  s://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW/logo.png',
  tags: string[] // [ 'stablecoin' ]
}
export const JupiterForm: FC = () => {

  //TokenProps

  const [open, setOpen] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [walletTokens, setWalletTokens] = useState<any[]>([]);
  const [slippage, setSlippage] = useState(0.5);
  const [showFoundRoutes, setShowFoundRoutes] = useState(false)
  const [swapRoute, setSwapRoute] = useState(false);
  // const [refreshTimer, setRefreshTimer] = useState(false);
  const [coinGeckoList, setCoinGeckoList] = useState<any | null>(null);
  const [walletTokensPrices, setWalletTokensPrices] = useState<any | null>(null);
  const [tokenPrices, setTokenPrices] = useState<any | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<RouteInfo | null>(null);
  const [depositAndFee, setDepositAndFee] = useState<any | null>(null);
  const [feeValue, setFeeValue] = useState<number | null>(null);
  const [showInputTokenSelect, setShowInputTokenSelect] = useState(false);
  const [showOutputTokenSelect, setShowOutputTokenSelect] = useState(false);
  const [showSlippageSettingModal, setShowSlippageSettingModal] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const { publicKey, connected, wallet, signAllTransactions, signTransaction} = useWallet();
  const { connection } = useConnection();

type useJupiterProps = Parameters<typeof useJupiter>[0];
type useJupter = Omit<useJupiterProps, 'amount'> & { amount: null | number };

  //initial useJupterProps<>
  const [jupterProps, setJupterProps] = useState<useJupter>({
    amount: 0,
    inputMint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    outputMint: new PublicKey('MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac'),
    slippage: 0.5,
  });

    //fetch tokens and balances in wallet 
    const fetchWalletTokens = useCallback(async () => { 
      if (!publicKey) return;
      const ownedTokens: any[] = [];
      const ownedTokenAccounts = await getTokenAccountsByOwnerWithWrappedSol(connection, publicKey);
      ownedTokenAccounts.forEach((account) => {
        const decimals = tokens.find((token) => {
          token?.address === account.mint.toString();
        })?.decimals;
        const uiBalance = nativeToUi(account.amount, decimals || 6);
        ownedTokens.push({ account, uiBalance });
      });
      setWalletTokens(ownedTokens);
    }, [publicKey, connection, tokens]);

  //toggle input and output token switch
  const handleSwitchClick = () => {
    setJupterProps((val) => ({
      ...val,
      inputMint: jupterProps.outputMint,
      outputMint: jupterProps.inputMint,
    })
    )
    setOpen(!open);
  };

  //enter half of inputtoken
  const enterHalfAmountClick = () => {
    setJupterProps((val) => ({
      ...val,
      amount: inputTokenBalance() / 2,
    }))
  }

  //enter max of inputToken
  const enterMaxAmountClick = () => {
    setJupterProps((val) => ({
      ...val,
      amount: inputTokenBalance(),
    }))
  }

  useEffect(() => {
    if (connected) {
      fetchWalletTokens();
    }
  }, [connected, fetchWalletTokens])

  //get the info of inputToken and outputToken
  const [inputTokenInfo, outputTokenInfo] = useMemo(() => {
    return [
      tokens.find(item => item?.address === jupterProps.inputMint?.toBase58() || ''),
      tokens.find(item => item?.address === jupterProps.outputMint?.toBase58() || ''),
    ]
  }, [jupterProps.inputMint?.toBase58(), jupterProps.outputMint?.toBase58(), tokens]);

  //calculte amount in decimal
  const amountInDecimal = useMemo(() => {
    if (typeof jupterProps.amount === 'number') {
      return jupterProps.amount * 10 ** (inputTokenInfo?.decimals || 1);
    }
  }, [inputTokenInfo, jupterProps.amount]);

  
  const { routeMap, allTokenMints, routes, loading, exchange, error, refresh } = 
    useJupiter({
      ...jupterProps,
      amount: amountInDecimal ? amountInDecimal : 0,
      slippage,
    });
  
  //Fetch token list from Jupiter API
  useEffect(() => {
    fetch(TOKEN_LIST_URL['mainnet-beta'])
      .then(response => response.json())
      .then(result => {
        const tokens = allTokenMints.map(mint => result.find((item: any) => item?.address === mint));
        setTokens(tokens);
      })
  }, [allTokenMints]);

  //refresh the exchange of route 
  useEffect(() => {
    if (routes) {
      setSelectedRoute(routes[0]);
    }
  }, [routes])
  //the balance of inputToken
  const inputTokenBalance = () => {
    if (walletTokens.length) {
      const walletToken = walletTokens.filter((token) => {
        return token.account.mint.toString() === inputTokenInfo?.address;
      });
      const largestTokenAccount = sortBy(walletToken, 'uiBalance').reverse()[0];
      return largestTokenAccount?.uiBalance || 0
    }
    return 0
  }

  const [walletTokenWithInfos] = useMemo(() => {
    const userTokens: any[] = [];
    tokens.map((item) => {
      const found = walletTokens.find((token) => {
        token.account.mint.toBase58() === item?.address;
      })
      if (found) {
        userTokens.push({ ...found, item });
      }
    })
    return [userTokens]
  }, [walletTokens, tokens])

  const getWalletTokenPrices = async () => {
    const ids = walletTokenWithInfos.map((token) => {
      token.item.extensions?.coingeckoid;
    })
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.toString()}&vs_currencies=usd`
    )
    const data = await response.json();
    setWalletTokensPrices(data)
  }

  //the balance of outputToken
  const outputTokenBalance = () => {
    if (walletTokens.length) {
      const walletToken = walletTokens.filter((token) => {
        return token.account.mint.toString() === outputTokenInfo?.address;
      });
      const largestTokenAccount = sortBy(walletToken, 'uiBalance').reverse()[0];
      return largestTokenAccount?.uiBalance || 0
    }
    return 0
  }
  
  useEffect(() => {
    const fetchCoinGeckoList = async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
      const data = await response.json();
      setCoinGeckoList(data);
    }
    fetchCoinGeckoList();
  }, [])

  // useEffect(() => {
  //   const timer = setInterval(() => setRefreshTimer(false), 4000);
  //   return () => clearInterval(timer);
  // }, [refreshTimer])

  //refresh Deposit and Fee
  useEffect(() => {
    const getDepositAndFee = async () => {
      const fees = await selectedRoute?.getDepositAndFee();
      if (fees) {
        setDepositAndFee(fees);
      }
    }
    if (selectedRoute && connected) {
      getDepositAndFee();
    }
  }, [selectedRoute]);

  const inputTokenInfos = inputTokenInfo ? (inputTokenInfo as any) : null;
  const outputTokenInfos = outputTokenInfo ? (outputTokenInfo as any) : null;

  useEffect(() => {
    if (!coinGeckoList?.length) return;
    setTokenPrices(null);
    const fetchTokenPrices = async () => {
      const inputId = coinGeckoList.find((t) => inputTokenInfos?.extensions?.coingeckoId ?
        t?.id === inputTokenInfos.extensions.coingeckoId : 
        t?.symbol?.toLowerCase() === inputTokenInfo?.symbol?.toLowerCase())?.id;
      const outputId = coinGeckoList.find((t) => outputTokenInfos.extensions.coingeckoId ? 
        t?.id === outputTokenInfos.extensions.coingeckoId : 
        t?.symbol?.toLowerCase() === outputTokenInfo?.symbol.toLowerCase())?.id;

      if (inputId && outputId) {
        const results = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${inputId},${outputId}&vs_currencies=usd`
        )
        const json = await results.json();
        if (json[inputId]?.usd && json[outputId]?.usd) {
          setTokenPrices({
            inputTokenPrice: json[inputId]?.usd,
            outputTokenPrice: json[outputId]?.usd
          })
        }
      }
    }
    if (inputTokenInfo && outputTokenInfo) {
      fetchTokenPrices()
    }
  }, [inputTokenInfo, outputTokenInfo, coinGeckoList])

  const getSwapFeeTokenValue = async () => {
    if (!selectedRoute) return
    const mints = selectedRoute.marketInfos.map((info) => info.lpFee.mint)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${mints.toString()}&vs_currencies=usd`
    )
    const data = await response.json()

    const feeValue = selectedRoute.marketInfos.reduce((a, c) => {
      const feeToken = tokens.find((item) => item?.address === c.lpFee?.mint)
      // FIXME: Remove ts-ignore possibly move the logic out of a reduce
      // @ts-ignore
      const amount = c.lpFee?.amount / Math.pow(10, feeToken.decimals)
      if (data[c.lpFee?.mint]) {
        return a + data[c.lpFee?.mint].usd * amount
      }
      if (c.lpFee?.mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') {
        return a + 1 * amount
      }
    }, 0)
    if (feeValue) {
      setFeeValue(feeValue)
    }
  }

  useEffect(() => {
    if (selectedRoute) {
      getSwapFeeTokenValue()
    }
  }, [selectedRoute])

  const sortedTokenMints = sortBy(tokens, (token) => {
    return token?.symbol.toLowerCase();
  })

  const  outputTokenMints = useMemo(() => {
    if (routeMap.size && jupterProps.inputMint) {
      const routeOptions = routeMap.get(jupterProps.inputMint.toString());
      const routeOptionsTokens = routeOptions?.map((address) => {
        return tokens.find(token => {
          return token?.address === address;
        })
      }) ?? []
      return routeOptionsTokens
    } else { return sortedTokenMints }
  }, [routeMap, tokens, jupterProps.inputMint])

  const outAmountUi = selectedRoute ? selectedRoute.outAmount / 10 ** (outputTokenInfo?.decimals || 1) : null

  const swapDisabled = loading || !selectedRoute || routes?.length === 0; 

  const  handleSelectRoute = (route: any) => {
    setSelectedRoute(route);
    setShowFoundRoutes(false);
  }

  return (
    <div className="max-w-md m-auto min-w-[360px] md:min-w-[448px]">


      <div className="flex justify-between items-center pb-2">
        <div className="font-bold text-lg italic">
          <h1>Exchange</h1>
        </div>
        <div className="flex justify-center items-center ">
          <button
            className="p-2 rounded-full bg-white mr-1"
            onClick={() => refresh()}
            >
            <GrRotateRight className={`${loading ? "animate-refreshspin" : ""}`}/>
          </button>
          <button
            className="flex justify-center items-center p-1 px-2 rounded-lg bg-white text-md"
            onClick={() => setShowSlippageSettingModal(true)}
            >
            <AdjustmentsIcon height={20}/>
            <span className="text-center">&nbsp;{slippage.toString()} %</span>
          </button>
        </div>
      </div>


      {/*** the UI of swap tokens ***/}
      <div className="p-4 py-10 flex flex-col gap-y-2 rounded-xl shadow-lg bg-white shadow-gray-200">
        <div className="flex justify-between items-center">
          <label htmlFor="youpay" className="font-medium">You Pay</label>
          <span className="text-sm italic">
            Balance: 
            {inputTokenBalance()}&nbsp;{inputTokenInfo?.symbol ? inputTokenInfo?.symbol : 'SolTest'}
          </span>
        </div>


        <div className="flex">
          <input
            name="youpay"
            id="youpay"
            type="number"
            placeholder="0.00"
            pattern="[0-9]*"
            className="w-full bg-gray-200 rounded-lg font-bold text-right p-4 outline-none border shadow-xl"
            value={jupterProps.amount || ''}
            onInput={(e: any) => {
              let updateValue = Number(e.target?.value) || 0;
              updateValue = Number.isNaN(updateValue) ? 0 : updateValue;
              setJupterProps((val) => ({
                ...val,
                amount: Math.max(updateValue, 0)
              }));
            }}
          />
            <div className="absolute">
              <Button
                className="hover:bg-white rounded-lg text-base tracking-wide p-2 mt-2 ml-2 flex justify-center items-center"
                onClick={() => setShowInputTokenSelect(true)}
                startIcon={inputTokenInfo?.logoURI ? (
                  <img
                    className="rounded-full"
                    src={inputTokenInfo?.logoURI}
                    width="24"
                    height="24"
                    alt={inputTokenInfo.symbol}
                  />
                ) : (<CurrencyDollarIcon height={24}/>)}
                endIcon={<ChevronDownIcon height={20}/>}
                // onClick={() => setShowInputTokenOptions(true)}
                children={inputTokenInfo?.symbol ? inputTokenInfo?.symbol : "SolTest"}
              />
            </div>
            <button 
              className="absolute m-4 ml-44 opacity-50 hover:opacity-100"
              onClick={enterHalfAmountClick}
            >
              {`HALF`}
            </button>
            <button
              className="absolute m-4 ml-60 opacity-50 hover:opacity-100"
              onClick={enterMaxAmountClick}
            >
              {`MAX`}
            </button>
        </div>


        <div className="flex justify-center items-center pt-3">
          <button
            className="flex justify-center items-center bg-gray-200 p-1 rounded-full" 
            onClick={handleSwitchClick}>
            <SwitchVerticalIcon height={20} className={`${open ? 'rotate-[-180] transform duration-200' : 
                  'rotate-180 transform duration-200'}`}/>
          </button>
        </div>

        
        <div className="flex justify-between items-center">
          <label htmlFor="youreceive" className="font-medium">You Receive</label>
          <span className="text-sm italic">Balance: {outputTokenBalance()}&nbsp;{outputTokenInfo?.symbol ? outputTokenInfo?.symbol : "SolTest"}</span>
        </div>


        <div className="flex">
          <input 
            name="youreceive"
            id="youreceive"
            disabled
            type="number"
            placeholder="0.00"
            className="w-full bg-gray-200 rounded-lg font-bold text-right p-4 outline-none border shadow-xl"
            value={
              selectedRoute?.outAmount && jupterProps.amount 
                ? 
              //  Intl.NumberFormat("en", {
              //    minimumSignificantDigits: 1,
              //    maximumFractionDigits: 6,
              //  }).format(
                selectedRoute?.outAmount /
                  10 ** (outputTokenInfo?.decimals || 1)
                : ""
            }
          />
            <div className="absolute">
              <Button
                className="hover:bg-white rounded-lg text-base tracking-wide p-2 mt-2 ml-2 flex justify-center items-center"
                startIcon={outputTokenInfo?.logoURI ? (
                  <img 
                    className="rounded-full"
                    src={outputTokenInfo?.logoURI}
                    width="24"
                    height="24"
                    alt={outputTokenInfo?.symbol}
                  />
                ) : (<CurrencyDollarIcon height={24}/>)}
                endIcon={<ChevronDownIcon height={20}/>}
                onClick={() => setShowOutputTokenSelect(true)}
                children={outputTokenInfo?.symbol ? outputTokenInfo?.symbol : "SolTest"}
              />
            </div>    
        </div>


        {routes?.length && selectedRoute ? (
          <div className="pt-10">
            { selectedRoute === routes[0] ? (
              <div className="relative flex flex-nowrap items-center">
                <span className="absolute text-sm bg-success p-1 rounded-md mb-4">{`Best Route`}</span>
              </div>
            ) : null }
            <div className="relative text-sm bg-gray-200 opacity-70">
              <button
                className="absolute mt-[29px] ml-48 md:ml-[280px] px-2 font-medium border opacity-70 border-gray-600 rounded-md whitespace-nowrap hover:opacity-100 hover:bg-white"
                disabled={routes?.length === 1}
                onClick={() => setShowFoundRoutes(true)}
              >
                {`found ${routes.length} routes`}
              </button>
            </div>
            <div className="animate-refresh rounded-lg bg-gray-200">
              <div className="whitespace-nowrap border-2 p-4 rounded-lg border-success text-base min-w-[328px] md:min-w-[416px]">
                <div className="font-bold mb-1">
                  {selectedRoute?.marketInfos.map((info, index) => {
                    const includeSeparator = selectedRoute?.marketInfos.length > 1 && 
                      index !== selectedRoute?.marketInfos.length - 1;
                    return (
                      <span key={index}>
                        {`${info.amm.label} ${includeSeparator ? 'x ' : ''}`}
                      </span>
                    )
                  })}
                </div>
                <div className="text-xs">
                  {`${inputTokenInfo?.symbol} → `}
                  {selectedRoute?.marketInfos.map((info, index) => {
                    const includeArrow = selectedRoute?.marketInfos.length > 1 && 
                      index !== selectedRoute?.marketInfos.length - 1; 
                    return (
                      <span key={index}>
                        <span>
                          {tokens.find(item => item?.address === info?.outputMint?.toString())?.symbol}
                        </span>
                        <span>
                          {includeArrow ? ' → ' : ''}
                        </span>
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}


        <div className="mt-10">
          <Button 
            onClick={async () => {
              if (!connected && zeroKey !== publicKey) {
                // handleConnect()
              } else if (!loading && selectedRoute && connected && wallet && signAllTransactions && signTransaction) {
                setSwapping(true)
                let txCount = 1;
                let errorTxid;
                const swapResult = await exchange({
                  wallet: {
                    sendTransaction: wallet?.adapter?.sendTransaction,
                    publicKey: wallet?.adapter?.publicKey,
                    signAllTransactions,
                    signTransaction,
                  },
                  routeInfo: selectedRoute,
                  onTransaction: async (txid, totalTxs) => {
                    console.log("txid, totalTxs", txid, totalTxs);
                    if (txCount === totalTxs) {
                      errorTxid = txid;
                      notify({
                        type: "confirm",
                        title: "confirming Transaction",
                        txid
                      })
                    }
                    await connection.confirmTransaction(txid, "confirmed");
                    txCount ++ ;
                    return await connection.getTransaction(txid, {commitment: "confirmed"});
                  },
                })
                console.log("swapResult", swapResult);

                setSwapping(false);
                fetchWalletTokens();
                if ("error" in swapResult) {
                  console.log("error:", swapResult.error);
                  notify({
                    type: "error",
                    title: swapResult?.error?.name ? 
                      swapResult.error.name : '',
                    description: swapResult?.error?.message,
                    txid: errorTxid,
                  })
                } else if ("txid" in swapResult) {
                  const description = swapResult?.inputAmount && swapResult?.outputAmount ?
                   `Swapped ${swapResult.inputAmount / 
                    10 ** (inputTokenInfo?.decimals || 1)
                  } ${inputTokenInfo?.symbol} to ${
                    swapResult.outputAmount / 
                    10 ** (outputTokenInfo?.decimals || 1)
                  } ${outputTokenInfo?.symbol}` : ""

                  notify({
                    type: "success",
                    title: "Swap Successful",
                    description,
                    txid: swapResult.txid,
                  })
                  setJupterProps((val) => ({
                    ...val,
                    amount: null,
                  }))
                }
              }
            }}
            className={`flex flex-row justify-center items-center w-full rounded-lg text-lg font-medium tracking-wider p-3 text-success border border-success hover:bg-success hover:text-black
                        ${swapping && "bg-success text-black cursor-not-allowed opacity-60"}
                    `}
            disabled={swapping}
          >
            {swapping ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>)
            : "" }
            {connected ? (swapping ? "Swapping" : "Swap") : "Connect Wallet"}
          </Button>
        </div>

      {/*** show the details of current swap ***/}
        { routes?.length && selectedRoute && outAmountUi && jupterProps?.amount ? (
          <div className="flex flex-col pt-4 opacity-90 gap-y-2 p-2">
            <div className="flex flex-row items-center gap-x-2">
              <h1 className="font-bold italic">SwapInfo</h1>
              <button
                className="p-1 rounded-full bg-gray-200 hover:text-success relative"
                onClick={() => {
                  refresh();
                  // setRefreshTimer(true)
                }}  
              >
                <GrRotateRight className={`${loading ? "animate-refreshspin" : ""}`}/>
              </button>
            </div>
            <div className="flex flex-row items-center justify-between text-sm">
              <h2>Rate</h2>
              <div className="flex items-center flex-nowrap text-xs">
                <div className="pr-1">
                  { swapRoute ? (
                    <>
                      1 {inputTokenInfo?.symbol} ≈{" "}
                      {outAmountUi / jupterProps?.amount} {" "}
                      {outputTokenInfo?.symbol}
                    </>
                  ) : (
                    <>
                      1{outputTokenInfo?.symbol} ≈{" "}
                      {jupterProps?.amount / outAmountUi} {" "}
                      {inputTokenInfo?.symbol}
                    </>
                    )}
                </div>
                <button
                  className="hover:text-success"
                  onClick={() => setSwapRoute(!swapRoute)}
                >
                  <SwitchHorizontalIcon height={16}/>
                </button>
              </div>
            </div>
            <div className="text-xs text-right">
              {
                Math.abs((jupterProps?.amount / outAmountUi - tokenPrices?.outputTokenPrice / 
                  tokenPrices?.inputTokenPrice) / (jupterProps?.amount / outAmountUi) * 100).toFixed(1)
              } % { " "}
              <span className={
                `${((jupterProps?.amount / outAmountUi - tokenPrices?.outputTokenPrice / 
                  tokenPrices?.inputTokenPrice) / (jupterProps?.amount / outAmountUi) * 100 <= 0 ? 
                  "text-success" : 
                  "text-red-600"
                )}`}
              >
                {`${(
                  (jupterProps?.amount / outAmountUi - tokenPrices?.outputTokenPrice / 
                  tokenPrices?.inputTokenPrice) / (jupterProps?.amount / outAmountUi) * 100 <= 0 ? 
                    "cheapter" : 
                    "more expensive"
                )}`}
              </span>
              {" than CoinGecko"}
            </div>
            <div className="flex flex-row items-center justify-between text-sm">
              <h2 className="">Price Impact</h2>
              <div className="flex items-center flex-nowrap text-xs">
                {selectedRoute?.priceImpactPct * 100 < 0.1 ?
                  "< 0.1%" :
                  `~ ${(selectedRoute?.priceImpactPct * 100 ).toFixed(4)}%`
                  }
              </div>
            </div>
            <div className="flex flex-row items-center justify-between text-sm">
              <h2 className="">Minimum Received</h2>
              {outputTokenInfo?.decimals ? (
                <div className="flex items-center flex-nowrap text-xs">
                  {selectedRoute?.outAmountWithSlippage / 10 ** outputTokenInfo.decimals || 1}
                  {" "}
                  {outputTokenInfo?.symbol}
                </div>
              ) : null}
            </div>
            <div className="flex flex-row items-center justify-between text-sm">
              <h2 className="">Swap Fee</h2>
              {typeof feeValue === "number" ? (
                <div className="flex items-center flex-nowrap text-xs">
                  ≈ {feeValue?.toFixed(4)} USDC
                </div>
              ) : null}
            </div>
          </div>
        ) : null }

      </div>
      

      {/*** show found routes ***/}
      {showFoundRoutes ? (
        <Modal
          isOpen={showFoundRoutes}
          onClose={() => setShowFoundRoutes(false)}
        >
          <div className="text-center text-lg font-bold mb-4">
            {routes?.length} routes founded
          </div>
          <div className="overflow-y-auto max-h-96 overflow-x-hidden pr-1 tracking-widest">
            {routes?.map((route, index) => {
              const selected = selectedRoute === route;
              return (
                <div 
                  key={index}
                  className="mb-2"
                >
                  <button
                    className={`w-full p-4 hover:bg-gray-200 focus:bg-success outline-none border-2 rounded-md
                              ${selected && "border-success text-success"}
                    `}
                    onClick={() => handleSelectRoute(route)}
                  >
                    <div className="flex flex-row justify-between items-center text-left">
                      <div>
                        <div className="overflow-ellipsis whitespace-nowrap">
                          {route.marketInfos.map((info, index) => {
                            const includeSeparator = route.marketInfos.length > 1 &&
                                  index !== route.marketInfos.length - 1;
                            return (
                              <span key={index}>
                                {`${info.amm.label}
                                  ${includeSeparator ? "x" : ""}
                                `}
                              </span>
                            )
                          })}
                        </div>
                        <div className="text-xs font-normal text-gray-500">
                          {`${inputTokenInfo?.symbol} → `}
                          {route.marketInfos?.map((info, index) => {
                            const includeArrow = route.marketInfos.length > 1 && 
                                  index !== route.marketInfos.length - 1;
                            return (
                              <span key={index}>
                                <span>
                                  {tokens.find(token => token?.address === info?.outputMint?.toString())?.symbol}
                                </span>
                                <span className="">
                                  {includeArrow ? ' → ' : ' '}
                                </span>
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      <div className="text-center text-lg">
                          {route.outAmount / 10 ** (outputTokenInfo?.decimals || 1)}
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </Modal>
      ) : null}

      <div className="pt-2 italic text-right">Powered by Jupiter</div>

      {/**** show the outputToken select settings ****/}   
      {showInputTokenSelect ? (
        <SwapTokenSelect
          isOpen={showInputTokenSelect}
          onClose={() => setShowInputTokenSelect(false)}
          soredTokenMints={allTokenMints}
          onTokenSelect={(token) => {
            setShowInputTokenSelect(false);
            setJupterProps((val) => ({
              ...val,
              inputMint: new PublicKey(token?.address)
            }))
          }}
        />
      ) : null}

      {/**** show the outputToken select settings ****/}      
      {showOutputTokenSelect ? (
        <SwapTokenSelect
          isOpen={showOutputTokenSelect}
          onClose={() => setShowOutputTokenSelect(false)}
          soredTokenMints={outputTokenMints}
          onTokenSelect={(token) => {
            setShowOutputTokenSelect(false);
            setJupterProps((val) => ({
              ...val,
              outputMint: new PublicKey(token?.address)
            }))
          }}
        />
      ) : null}

      {/**** show the swap slippage settings ****/}
      {showSlippageSettingModal ? (
        <SlippageSettingsModal
        isOpen={showSlippageSettingModal}
        onClose={() => setShowSlippageSettingModal(false)}
        slippage={slippage}
        setSlippage={setSlippage}
        />
      ) : null}

    </div> 
  )
}

