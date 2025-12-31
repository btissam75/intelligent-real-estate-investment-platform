// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ImmoTitle is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 private _nextId;

    constructor() ERC721("ImmoBack Title", "IMT") Ownable(msg.sender) {
        _nextId = 1;
    }

    function mintTo(address to, string memory tokenUri) external onlyOwner {
        uint256 tokenId = _nextId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);
    }

    // --- Overrides requis (OZ v5 + Solidity 0.8.20) ---

    // tokenURI est défini dans ERC721 et ERC721URIStorage -> préciser les deux
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return ERC721URIStorage.tokenURI(tokenId);
    }

    // _update est défini dans ERC721 et ERC721Enumerable (PAS dans ERC721URIStorage dans ta version)
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    // _increaseBalance est défini dans ERC721 et ERC721Enumerable
    function _increaseBalance(address account, uint128 amount)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, amount);
    }

    // supportsInterface : si ta version d’OZ ajoute IERC4906 via ERC721URIStorage,
    // conserve les 3 parents. Si ça reprovoque l’erreur, remplace la ligne d'override
    // par: override(ERC721, ERC721Enumerable)
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
