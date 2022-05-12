import { FC } from "react";

export const RouteList: FC = ({routes, selectedRoute, handleSelectedRoute, inputTokenInfo, tokens, outputTokenInfo}:any) => {
  return (
    <div className="">
          <div className="">
            { routes?.map((route, index) => {
              const selected = selectedRoute === route;
              return(
                <div
                  key={index}
                  className={`p-2 
                    ${selected ? 'border-success' : ''}`}
                >
                  <button
                    className=""
                    onClick={() => handleSelectedRoute(route)}
                    >
                      <div className="">
                        {route.marketInfos.map((info, index) => {
                          const includeSeparator = route.marketInfos.length > 1 &&
                            index !== route.marketInfos.length - 1;
                          return (
                            <span key={index} className="">
                              {`${info.amm.label} ${includeSeparator ? 'x' : ''}`}
                            </span>
                          )
                        })}
                      </div>
                      <div className="">
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
                    <div className="">
                      {route.outAmount /10 ** (outputTokenInfo?.decimals || 1)}
                    </div> 
                  </button>
                </div>
              )
            })}
          </div>
        </div>
        )
}