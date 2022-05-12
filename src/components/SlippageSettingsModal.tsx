import { useState } from "react";
import { ButtonGroup } from "./ButtonGroup";
import Modal from './Modal';

const SLIPPAGEPRESETS = ["0.1", "0.2", "0.5", '1']


interface SlippageSettingsModalProps {
  isOpen: boolean;
  onClose?: () => void;
  slippage: number;
  setSlippage: (x: number) => void;
}
export const SlippageSettingsModal = ({
  isOpen,
  onClose,
  slippage,
  setSlippage,
}: SlippageSettingsModalProps) => {
  
  const [showSlippageOrCustom, setShowSlippageOrCustom] = useState(false);
  const [preSlippage, setPreSlippage] = useState(slippage);
  const [inputValue, setInputValue] = useState(preSlippage ? preSlippage.toString()  : "");

  const handleSetPreSlippage = (value: any) => {
    setPreSlippage(value);
    setInputValue("");
  }

  const handleSave = () => {
    setSlippage(inputValue ? parseFloat(inputValue) : preSlippage)
    onClose?.();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>
        <h2 className="text-lg font-bold">
          Slippage Settings
        </h2>
      </Modal.Header>
      <div className="flex flex-row justify-between pb-2">
        <label htmlFor="slippage">
          Slippage
        </label>
        <button
        className="border-0 font-medium underline hover:no-underline hover:opacity-60 focus:outline-none"
        onClick={() => setShowSlippageOrCustom(!showSlippageOrCustom)}
        >
          {showSlippageOrCustom ? "Presets" : "Custom"}
        </button>
      </div>
      {showSlippageOrCustom ? (
        <div className="pb-4 relative">
          <span className="absolute right-0 pr-3 pt-2">%</span>
          <input
            type="text"
            placeholder="0.00"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-10 w-full rounded-md border bg-gray-200 focus:outline-none p-4"
          />
        </div>
      ) : (
        <div className="pb-4">
          <ButtonGroup
            activeValue={inputValue.toString()}
            onChange={(value) => handleSetPreSlippage(value)}
            unit="%"
            values={SLIPPAGEPRESETS}
          />
        </div>
      )}
      <div className="flex justify-center">
        <button
          className="w-full rounded-full p-2 font-bold border border-success bg-success opacity-80 hover:bg-success hover:opacity-100" 
          onClick={handleSave}>
          Save
        </button>
      </div>
      
    </Modal>
  )
}