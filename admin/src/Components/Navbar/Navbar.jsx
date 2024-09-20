import React from 'react'
import "./Navbar.css"
import logo from "../../assets/logo.png"
import navProfile from "../../assets/Profile.png"

const Navbar = () => {
    return (
        <div className='navbar'>
            <div className='navbar-logo'>
                <img src={logo} alt="" className="nav-logo" />
                <div className='navbar-name'>
                    <h3>QuickMart</h3>
                    <p>Admin Panel</p>
                </div>
            </div>
            <img src={navProfile} alt="" className='nav-profile' />
        </div>
    )
}

export default Navbar
