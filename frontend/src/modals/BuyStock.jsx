import React, { useState } from 'react';

const BuyStock = ({ stockName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  const handleBuy = (e) => {
    e.preventDefault();
    // Add your buy logic here
    if (quantity <= 0) {
      setErrorMessage('Quantity must be greater than zero.');
      document.getElementById("errorAlert").style.display = "flex";
      return;
    }

    // Simulate a successful buy operation
    console.log(`Buying ${quantity} of ${stockName}`);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 px-6 py-2 mx-auto tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
      >
        SQUARE OFF
      </button>

      {isOpen && (
        <div
          id="crud-modal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed inset-0 z-50 flex justify-center items-center w-full h-full overflow-x-hidden overflow-y-auto"
          style={{ display: 'flex' }} // Correct usage of style prop
        >
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 w-full max-w-md p-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Place Buy Order
              </h3>
              <button
                type="button"
                data-modal-toggle="crud-modal"
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setIsOpen(false)} // Close modal on click
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <form id="buyForm" className="mt-4" onSubmit={handleBuy}>
              <div className="mb-4">
                <label
                  htmlFor="modalQuantity"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Quantity
                </label>
                <input
                  type="number"
                  id="modalQuantity"
                  className="mt-1 p-2 w-full border rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="modalBuyPrice"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Current Price
                </label>
                <input
                  type="number"
                  id="modalBuyPrice"
                  className="mt-1 p-2 w-full border rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white"
                  placeholder="Buy price"
                  readOnly
                />
              </div>
              <div
                className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
                role="alert"
                id="errorAlert"
                style={{ display: 'none' }} // Correct usage of style prop
              >
                <svg
                  className="flex-shrink-0 inline w-4 h-4 mr-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="sr-only">Info</span>
                <div>
                  <span className="font-medium" id="feedback404">{errorMessage}</span>
                </div>
              </div>
              <div className="flex flex-row">
                <button
                  id="confirmBuyButton"
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Confirm
                </button>
                <button
                  id="cancelButton"
                  type="button"
                  data-modal-toggle="crud-modal"
                  className="w-1/2 py-2 px-4 ml-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 dark:bg-gray-500 dark:hover:bg-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BuyStock;