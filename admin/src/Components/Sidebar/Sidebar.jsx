import React from 'react'
import "./Sidebar.css"
import { Link } from "react-router-dom"

const Sidebar = () => {
    return (
        <div className='sidebar'>
            <Link to={'/addproduct'} style={{ textDecoration: "none", color:"orangered" }}>
                <div className="sidebar-item">
                    <i className="fa-solid fa-cart-plus fa-2xl"></i>
                    <p>Add Product</p>
                </div>
            </Link>
            <Link to={'/listproduct'} style={{ textDecoration: "none", color:"orangered" }}>
                <div className="sidebar-item">
                    <i className="fa-solid fa-clipboard-list fa-2xl"></i>
                    <p>Product List</p>
                </div>
            </Link>
        </div>
    )
}

export default Sidebar
