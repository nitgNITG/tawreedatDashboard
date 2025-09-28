export interface Brand {
    id: number
    name: string
    logo: string
  }
  
  export interface Coupon {
    id: number
    brandId: number
    ratio: number
    validTo: string
    code: string
    description: string
    validFrom: string
    createdAt: string
    updatedAt: string
    brand: Brand
  }
  
  export interface CouponsResponse {
    coupons: Coupon[]
  } 