import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useCart from '../../Hooks/UseCart';
import { addToDb, getStoredCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import "./Shop.css";
const Shop = () => {
    const [products, SetProducts] = useState([]);
    const [cart, setCart] = useCart();
    const [searchResultProduct, setsearchResultProduct] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState(0);
    const size = 10;
    useEffect(() => {
        fetch(`http://localhost:5000/products?page=${page}&&size=${size}`)
            .then(res => res.json())
            .then(data => {
                SetProducts(data.products);
                setsearchResultProduct(data.products);
                const count = data.count;
                const pageNumber = Math.ceil(count / size);
                setPageCount(pageNumber);
            })
    }, [page]);

    useEffect(() => {
        if (products.length) {
            const saveCartProduct = getStoredCart();
            const addedProductCart = [];
            for (const key in saveCartProduct) {
                const addedProduct = products.find(product => product.key === key);
                if (addedProduct) {
                    const quantity = saveCartProduct[key];
                    addedProduct.quantity = quantity;
                    addedProductCart.push(addedProduct);
                }
            };
            setCart(addedProductCart);
        }
    }, []);
    const handleBuyNow = (product) => {
        const exist = cart.find(pd => pd.key === product.key);
        let newCart = [];
        if (exist) {
            const remening = cart.filter(pd => pd.key !== product.key);
            exist.quantity = exist.quantity + 1;
            newCart = [...remening, product];
        } else {
            product.quantity = 1;
            newCart = [...cart, product];
        }
        setCart(newCart);
        addToDb(product.key);
    }
    const handleSearch = (e) => {
        const searchText = e.target.value;
        const machedProduct = products.filter(product => product.name.toLowerCase().includes(searchText.toLowerCase()));
        setsearchResultProduct(machedProduct);
    }
    if (products.length === 0) {
        return (
            <div class="loader">Loading...</div>
        )
    }
    return (
        <div>
            <div className="seacrch-container">
                <input type="text" onChange={handleSearch} placeholder="Search Your Product Name" />
            </div>
            <div className="shop-container">
                <div className="product-container">
                    <h2>All Product</h2>
                    <div>
                        {
                            searchResultProduct.flatMap(product => <Product key={product.key} product={product} handleBuyNow={handleBuyNow}></Product>)
                        }
                    </div>
                    {/* pagination */}
                    <div className="pagination">
                        {
                            [...Array(pageCount).keys()].map(number => <button
                                className={number === page ? 'selected' : ''}
                                key={number}
                                onClick={() => setPage(number)}
                            >{number + 1}</button>)
                        }
                    </div>
                </div>
                <div className="cart-container">
                    <Cart cart={cart}>
                        <Link to="/order-review">
                            <button className="button">Review Order</button>
                        </Link>
                    </Cart>
                </div>
            </div>
        </div>
    );
};

export default Shop;