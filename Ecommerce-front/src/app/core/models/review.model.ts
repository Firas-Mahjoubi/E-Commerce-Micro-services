export interface Review {
  id: number;
  product: ProductInfo;
  userId: string;
  userName: string;
  userEmail?: string;  // Email de l'utilisateur
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInfo {
  id: string;
  name: string;
  description: string;
  price: number;
  skuCode: string;
  category: string;
  imageUrls: string[];
  stockQuantity: number;
  active: boolean;
  inStock: boolean;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRequest {
  productId: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  rating: number;
  title: string;
  comment: string;
  verified?: boolean;
}

export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  verifiedReviewsCount: number;
}

export interface SellerReviewStatistics {
  totalReviews: number;
  averageRating: number;
  verifiedReviewsCount: number;
  ratingDistribution: { [key: number]: number };
  recentReviewsCount: number;
  productCount: number;
}

export interface ReviewTrends {
  dailyReviews: { date: string; count: number }[];
  averageRatingTrend: { date: string; rating: number }[];
  totalReviewsLastMonth: number;
  averageRatingLastMonth: number;
}
