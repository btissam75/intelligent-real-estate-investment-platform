// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// NFT "titre" soulbound: non transférable (sauf mint/burn par l'owner)
contract ImmoNFT is ERC721, Ownable {
    string public baseURI;
    mapping(uint256 => string) private _tokenURIs;

    constructor(string memory _name, string memory _symbol, string memory _base)
        ERC721(_name, _symbol) Ownable(msg.sender)
    { baseURI = _base; }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory _base) external onlyOwner {
        baseURI = _base;
    }

    function mintTo(address to, uint256 tokenId, string memory tokenUri) external onlyOwner {
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = tokenUri; // ipfs://...
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory u = _tokenURIs[tokenId];
        return bytes(u).length > 0 ? u : super.tokenURI(tokenId);
    }

    // Empêche transferts utilisateur→utilisateur (soulbound)
    function _update(address to, uint256 tokenId, address auth)
        internal override returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            require(msg.sender == owner(), "Soulbound: non-transferable");
        }
        return super._update(to, tokenId, auth);
    }
}
