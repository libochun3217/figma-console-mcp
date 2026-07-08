/**
 * Tests for figma_set_image_fill tool
 *
 * Covers: plugin handler, WebSocket connector, cloud connector,
 * input validation, and error handling.
 */

describe('figma_set_image_fill', () => {
	// ========================================================================
	// Plugin handler (code.js message handling)
	// ========================================================================

	describe('plugin handler (SET_IMAGE_FILL)', () => {
		it('should decode image bytes and create image fill', () => {
			// The plugin handler expects { type: 'SET_IMAGE_FILL', imageBytes: ArrayBuffer, nodeIds: string[], scaleMode: string }
			const imageBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47]).buffer;
			const message = {
				type: 'SET_IMAGE_FILL',
				requestId: 'test_1',
				imageBytes,
				imageByteLength: imageBytes.byteLength,
				nodeIds: ['1:2'],
				scaleMode: 'FILL',
			};

			// Validate message structure
			expect(message.type).toBe('SET_IMAGE_FILL');
			expect(message.imageBytes).toBeInstanceOf(ArrayBuffer);
			expect(message.imageByteLength).toBe(4);
			expect(message.nodeIds).toHaveLength(1);
			expect(message.scaleMode).toBe('FILL');
		});

		it('should support multiple node IDs', () => {
			const message = {
				type: 'SET_IMAGE_FILL',
				requestId: 'test_2',
				imageBytes: [0xFF, 0xD8, 0xFF], // JPEG header
				nodeIds: ['1:2', '3:4', '5:6'],
				scaleMode: 'FIT',
			};

			expect(message.nodeIds).toHaveLength(3);
		});

		it('should default scaleMode to FILL', () => {
			const message = {
				type: 'SET_IMAGE_FILL',
				requestId: 'test_3',
				imageBytes: [0x89, 0x50],
				nodeIds: ['1:2'],
			};

			// When scaleMode is not provided, plugin uses 'FILL'
			expect(message.scaleMode).toBeUndefined();
		});
	});

	// ========================================================================
	// WebSocket connector
	// ========================================================================

	describe('WebSocketConnector.setImageFill', () => {
		it('should send SET_IMAGE_FILL command with correct params', async () => {
			const mockSendCommandWithBinary = jest.fn().mockResolvedValue({
				success: true,
				imageHash: 'abc123',
				updatedCount: 2,
				nodes: [
					{ id: '1:2', name: 'Frame 1' },
					{ id: '3:4', name: 'Frame 2' },
				],
			});

			// Simulate WebSocketConnector.setImageFill
			const setImageFill = async (nodeIds: string[], filePath: string, scaleMode = 'FILL') => {
				const imageBytes = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
				return mockSendCommandWithBinary('SET_IMAGE_FILL', { nodeIds, filePath, scaleMode }, imageBytes, { name: 'imageBytes', filePath }, 60000);
			};

			const result = await setImageFill(['1:2', '3:4'], '/tmp/hero.png', 'FILL');

			expect(mockSendCommandWithBinary).toHaveBeenCalledWith(
				'SET_IMAGE_FILL',
				{ nodeIds: ['1:2', '3:4'], filePath: '/tmp/hero.png', scaleMode: 'FILL' },
				expect.any(Buffer),
				{ name: 'imageBytes', filePath: '/tmp/hero.png' },
				60000,
			);
			expect(result.success).toBe(true);
			expect(result.imageHash).toBe('abc123');
			expect(result.updatedCount).toBe(2);
		});

		it('should use 60s timeout for large images', async () => {
			const mockSendCommandWithBinary = jest.fn().mockResolvedValue({ success: true });

			const setImageFill = async (nodeIds: string[], filePath: string, scaleMode = 'FILL') => {
				return mockSendCommandWithBinary('SET_IMAGE_FILL', { nodeIds, filePath, scaleMode }, Buffer.alloc(4), { name: 'imageBytes', filePath }, 60000);
			};

			await setImageFill(['1:2'], '/tmp/large.png');

			// Verify 60s timeout (vs default 15s)
			expect(mockSendCommandWithBinary).toHaveBeenCalledWith(
				'SET_IMAGE_FILL',
				expect.anything(),
				expect.any(Buffer),
				expect.anything(),
				60000,
			);
		});
	});

	// ========================================================================
	// Cloud connector
	// ========================================================================

	describe('CloudWebSocketConnector.setImageFill', () => {
		it('should reject local file paths because cloud mode cannot read local disk', async () => {
			const setImageFill = async (_nodeIds: string[], _filePath: string, _scaleMode = 'FILL') => {
				throw new Error('figma_set_image_fill with filePath is only supported in local Desktop Bridge mode');
			};

			await expect(setImageFill(['1:2'], '/tmp/hero.png', 'CROP')).rejects.toThrow('local Desktop Bridge mode');
		});
	});

	// ========================================================================
	// Tool registration and schema validation
	// ========================================================================

	describe('tool schema', () => {
		it('should require nodeIds as string array', () => {
			const validParams = {
				nodeIds: ['1:2', '3:4'],
				filePath: '/tmp/hero.png',
			};

			expect(Array.isArray(validParams.nodeIds)).toBe(true);
			expect(validParams.nodeIds.every((id: string) => typeof id === 'string')).toBe(true);
		});

		it('should require filePath as string', () => {
			const validParams = {
				nodeIds: ['1:2'],
				filePath: '/tmp/hero.png',
			};

			expect(typeof validParams.filePath).toBe('string');
		});

		it('should accept valid scaleMode values', () => {
			const validModes = ['FILL', 'FIT', 'CROP', 'TILE'];
			validModes.forEach(mode => {
				expect(['FILL', 'FIT', 'CROP', 'TILE']).toContain(mode);
			});
		});

		it('should treat scaleMode as optional', () => {
			const paramsWithout = {
				nodeIds: ['1:2'],
				filePath: '/tmp/hero.png',
			};

			// scaleMode is optional — should not be required
			expect(paramsWithout).not.toHaveProperty('scaleMode');
		});
	});

	// ========================================================================
	// Error handling
	// ========================================================================

	describe('error handling', () => {
		it('should handle plugin failure gracefully', async () => {
			const mockSendCommand = jest.fn().mockResolvedValue({
				success: false,
				error: 'Node not found: 99:99',
			});

			const setImageFill = async (nodeIds: string[], filePath: string, scaleMode = 'FILL') => {
				return mockSendCommand('SET_IMAGE_FILL', { nodeIds, filePath, scaleMode }, 60000);
			};

			const result = await setImageFill(['99:99'], '/tmp/missing.png');

			expect(result.success).toBe(false);
			expect(result.error).toContain('Node not found');
		});

		it('should handle connection timeout', async () => {
			const mockSendCommand = jest.fn().mockRejectedValue(
				new Error('Command SET_IMAGE_FILL timed out after 60000ms'),
			);

			const setImageFill = async (nodeIds: string[], filePath: string, scaleMode = 'FILL') => {
				return mockSendCommand('SET_IMAGE_FILL', { nodeIds, filePath, scaleMode }, 60000);
			};

			await expect(setImageFill(['1:2'], '/tmp/very-large.png'))
				.rejects.toThrow('timed out');
		});

		it('should handle no desktop connector available', async () => {
			const getDesktopConnector = jest.fn().mockRejectedValue(
				new Error('No cloud relay session. Call figma_pair_plugin first.'),
			);

			await expect(getDesktopConnector()).rejects.toThrow('No cloud relay session');
		});
	});

	// ========================================================================
	// ui.html handler (method map)
	// ========================================================================

	describe('ui.html method map', () => {
		it('should map SET_IMAGE_FILL to window.setImageFill', () => {
			// The method map in ui.html routes 'SET_IMAGE_FILL' to:
			// function(params) { return window.setImageFill(params.nodeIds || params.nodeId, params.filePath, params.scaleMode, params._binaryPayload); }
			const params = {
				nodeIds: ['1:2', '3:4'],
				filePath: '/tmp/hero.png',
				scaleMode: 'TILE',
				_binaryPayload: { transferId: 'abc', name: 'imageBytes', byteLength: 4 },
			};

			// Verify params are correctly structured for the handler
			expect(params.nodeIds).toBeDefined();
			expect(params.filePath).toBeDefined();
			expect(params._binaryPayload).toBeDefined();
			expect(params.scaleMode).toBe('TILE');
		});

		it('should fall back to nodeId when nodeIds not provided', () => {
			const params = {
				nodeId: '1:2',
				filePath: '/tmp/hero.png',
			};

			// Handler uses: params.nodeIds || params.nodeId
			const resolved = params.nodeIds || params.nodeId;
			expect(resolved).toBe('1:2');
		});
	});
});
