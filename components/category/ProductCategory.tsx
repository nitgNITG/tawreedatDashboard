import { Link } from '@/i18n/routing'
import { fetchData } from '@/lib/fetchData'
import Image from 'next/image'
import React from 'react'
import ImageApi from '../ImageApi'

const ProductCategory = async ({ categoryId, locale }: { categoryId: any, locale: string }) => {
    const { data, error } = await fetchData(`/api/products?categoryId=${categoryId}&fields=images=id-url,name,id&lang=${locale}`, {
        cache: "no-cache"
    })

    return (
        !data?.products?.length ? "" :
            <div className='lg:w-[calc(100vw-23rem)] p-container pb-10'>
                <div className='space-y-5'>
                    <div>
                        <h2 className='text-2xl font-bold'>
                            Products :
                        </h2>
                    </div>
                    <div className='flex gap-5 overflow-x-auto'>
                        {data?.products?.map((product: any) => (
                            <div
                                // href={`/${product.id}`}
                                className='border w-56 bg-white rounded-lg shadow-md'
                                key={product.id}>
                                <div
                                    className='w-56 h-56 flex justify-center items-center'>
                                    <ImageApi
                                        src={product.images[0]?.url ?? '/imgs/notfound.png'}
                                        alt={product.name}
                                        height={500}
                                        width={500}
                                        className='size-full border-b object-cover object-top rounded-t-md'
                                    />
                                </div>
                                <div className='py-5 flex justify-between items-center px-3'>
                                    <div>
                                        <h4 className='text-lg font-medium'>{product.name}</h4>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
    )
}

export default ProductCategory