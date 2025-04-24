'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { CartItem } from './cart-item';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, getSubtotal, getItemCount, clearCart } = useCart();
  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-900 shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                          Shopping cart
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={onClose}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        {items.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">
                              Your cart is empty
                            </p>
                            <Link
                              href="/products"
                              className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
                              onClick={onClose}
                            >
                              Continue Shopping
                            </Link>
                          </div>
                        ) : (
                          <>
                            <div className="flow-root">
                              <div className="-my-6 divide-y divide-gray-200 dark:divide-gray-700">
                                {items.map((item) => (
                                  <CartItem key={item.id} item={item} />
                                ))}
                              </div>
                            </div>

                            {itemCount > 3 && (
                              <div className="mt-6 flex justify-center">
                                <Link
                                  href="/cart"
                                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                  onClick={onClose}
                                >
                                  View all {itemCount} items
                                </Link>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {items.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                          <p>Subtotal</p>
                          <p>${subtotal.toFixed(2)}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                          Shipping and taxes calculated at checkout.
                        </p>
                        <div className="mt-6 space-y-2">
                          <Link
                            href="/checkout"
                            className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 w-full"
                            onClick={onClose}
                          >
                            Checkout
                          </Link>
                          <Link
                            href="/cart"
                            className="flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 w-full"
                            onClick={onClose}
                          >
                            View Cart
                          </Link>
                          <button
                            type="button"
                            className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-full"
                            onClick={() => {
                              clearCart();
                              onClose();
                            }}
                          >
                            Clear Cart
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}