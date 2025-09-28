export interface DashboardStats {
  totalUsers: number;
  totalCategories: number;
  totalOrders: number;
  totalProducts: number;
  totalAds: number;
  totalOnBoarding: number;
  totalFaqs: number;
  totalArticles: number;
  totalBrands: number;
}


export interface DashboardProps {
  data: DashboardStats;
}
