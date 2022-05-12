import { FC } from 'react';

interface ButtonGroupProps {
  activeValue: string;
  className?: string;
  unit?: string;
  onChange: (x : any) => void;
  values?: Array<any>;
  names?: Array<string>;

}

export const ButtonGroup: FC<ButtonGroupProps> = ({
  activeValue,
  className,
  unit,
  onChange,
  values,
  names,
}) => {
  return (
    <div className="rounded-lg bg-white">
      <div className="flex flex-row">
        {activeValue && values?.includes(activeValue) ? (
            <div
              className={`default-transition absolute left-0 top-0 h-full transform rounded-md bg-th-bkg-4`}
              style={{
                transform: `translateX(${
                  values.findIndex((v) => v === activeValue) * 100
                }%)`,
                width: `${100 / values.length}%`,
              }}
            />
          ) : null}
        {values?.map((value, index) => (
          <button
            className={`${className} rounded-lg p-3 text-center text-sm font-normal focus:bg-success focus:text-black
              ${value === activeValue ? "bg-success" : "hover:text-success"}
          `}
          key={index}
          onClick={() => onChange(value)}
          style={{width: `${100 / values.length}%`}}
          >
            {names ? (unit ? names[index] + unit : names[index]) : (unit ? value + unit : value)}
          </button>
        ))}
      </div>
    </div>
  )
}