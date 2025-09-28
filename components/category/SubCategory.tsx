import { Link } from '@/i18n/routing'
import { fetchData } from '@/lib/fetchData'
import Image from 'next/image'
import React from 'react'
import ImageApi from '../ImageApi'

const SubCategory = async ({ categoryId, locale }: { categoryId: any, locale: string }) => {
    const { data, error } = await fetchData(`/api/category?parentId=${categoryId}&lang=${locale}`, {
        cache: "no-cache"
    })

    return (
        !data?.categories?.length ? "" :
            <div className='lg:w-[calc(100vw-23rem)] p-container py-10'>
                <div className='space-y-5'>
                    <div>
                        <h2 className='text-2xl font-bold'>
                            Sub categories :
                        </h2>
                    </div>
                    <div className='flex gap-5 overflow-x-auto'>
                        {data?.categories?.map((category: any) => (
                            <Link
                                href={`/category/${category.id}`}
                                className='border bg-white rounded-lg shadow-md w-56'
                                key={category.id}>
                                <div
                                    className='w-56 h-56 flex justify-center items-center'>
                                    <ImageApi
                                        src={category.imageUrl || '/imgs/notfound.png'}
                                        alt={category.name}
                                        height={500}
                                        width={500}
                                        className='size-full border-b object-cover object-top rounded-t-md'
                                    />
                                </div>
                                <div className='py-5 flex justify-between items-center px-3'>
                                    <div>
                                        <h4 className='text-lg font-medium'>{category.name}</h4>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
    )
}

export default SubCategory