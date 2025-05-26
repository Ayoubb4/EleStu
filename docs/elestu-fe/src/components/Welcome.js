import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyAuth, logout } from '../services/authService';
import { getProviders } from '../services/marketplaceService';

function Welcome() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState([]);
    const [search, setSearch] = useState('');
    const [filtered, setFiltered] = useState([]);

    useEffect(() => {
        const init = async () => {
            const isValid = await verifyAuth();
            if (!isValid) {
                navigate('/login');
                return;
            }
            const list = await getProviders();
            setProviders(list);
            setFiltered(list);
            setLoading(false);
        };
        init();
    }, [navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearch(term);
        const results = providers.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.services.some(s => s.toLowerCase().includes(term))
        );
        setFiltered(results);
    };

    if (loading) {
        return <div className="text-center mt-10">Cargando contenido...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Marketplace Musical</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                >Cerrar sesión</button>
            </header>

            <div className="mb-4">
                <input
                    type="text"
                    value={search}
                    onChange={handleSearch}
                    placeholder="Buscar servicios o profesionales..."
                    className="w-full p-2 border rounded"
                />
            </div>

            {filtered.length === 0 ? (
                <p className="text-gray-600">No se encontraron resultados.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filtered.map(provider => (
                        <div key={provider.id} className="border rounded-lg shadow-lg p-4 hover:shadow-xl transition">
                            <img
                                src={provider.avatar}
                                alt={provider.name}
                                className="w-full h-40 object-cover rounded"
                            />
                            <h2 className="text-xl font-semibold mt-3">{provider.name}</h2>
                            <p className="text-gray-600 mt-1">Servicios: {provider.services.join(', ')}</p>
                            <p className="text-gray-800 font-bold mt-2">Tarifa: {provider.rate} €/hora</p>
                            <button
                                onClick={() => navigate(`/provider/${provider.id}`)}
                                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
                            >Ver perfil</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Welcome;
